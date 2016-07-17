
var lineWidth = 3;
var traceMarkSize = 2;

var fixedPointSize = 10;
var fixedPointColor = 'green';

var movingPointSize = 6;
var movingPointColor = 'blue';


var numTracePoints = 300;

var canvas = document.getElementById('sbcanvas')
var ctx = canvas.getContext("2d");
var clickSize = 5;
var offsetX = canvas.offsetLeft;
var offsetY = canvas.offsetTop;
var vertexColors = { 'crankEnd': 'green', 'p1': 'blue', 'p2': 'purple', 'p3': 'yellow', 'p4': 'orange', 'p5': 'pink'};


// How will it look if all traces are the same color:

var tcClr = 'blue';

var vertexColors = { 'crankEnd': tcClr, 'p1': tcClr, 'p2': tcClr, 'p3': tcClr,
'p4': tcClr, 'p5': tcClr};

// On second thought, don't need to trace p1,p2,p3 which are always circular arcs:

var vertexColors = { 'crankEnd': tcClr, 
//		     'p1': tcClr, 'p2': tcClr, 'p3': tcClr,
		     'p4': tcClr, 'p5': tcClr};


// Used for dragging vertices.
var startX;
var startY;
var selectedVertex = null;

// Used to compute motion
var crankRad  // Crank shaft's radius
var dc1;      // Distance from cranshaft to 'p1'
var dc2;      // Distance from cranshaft to 'p2'
var d01;      // Distance between points 'p0' and 'p2'
var d02;      // Distance between points 'p0' and 'p2'
var d03;      // Distance between points 'p0' and 'p3'
var d13;      // Distance between points 'p1' and 'p3'
var d24;      // Distance between points 'p2' and 'p4'
var d25;      // Distance between points 'p2' and 'p5'
var d34;      // Distance between points 'p3' and 'p4'
var d45;      // Distance between points 'p4' and 'p5'

function Trails () {
  return { crankEnd: [], p1: [], p2: [], p3: [], p4: [], p5: [] };
}

var trails = new Trails();

function Pnt2 (xx, yy)
{
  this.x = xx;
  this.y = yy;
}

function init1 (p) {
  p.crankCtr = new Pnt2 (100, 273);
  p.crankEnd = new Pnt2 (185, 273);
  p.p0       = new Pnt2 (313, 317);
  p.p1       = new Pnt2 (373, 100);
  p.p2       = new Pnt2 (441, 477);
  p.p3       = new Pnt2 (509, 370);
  p.p4       = new Pnt2 (654, 517);
  p.p5       = new Pnt2 (380, 709);
}

function  PointSet ()
{
  this.crankCtr = new Pnt2(-99,-99);
  this.crankEnd = new Pnt2(-99,-99);
  this.p0 = new Pnt2(-99,-99);
  this.p1 = new Pnt2(-99,-99);
  this.p2 = new Pnt2(-99,-99);
  this.p3 = new Pnt2(-99,-99);
  this.p4 = new Pnt2(-99,-99);
  this.p5 = new Pnt2(-99,-99);
};

var ps = new PointSet();

if (false) {
  ps.crankCtr = new Pnt2 ( 217.0,  333.0);
  ps.crankEnd = new Pnt2 ( 270.0,  333.0);
  ps.p0 = new Pnt2       ( 350.0,  350.0);
  ps.p1 = new Pnt2       ( 387.0,  215.0);
  ps.p2 = new Pnt2       ( 430.0,  450.0);
  ps.p3 = new Pnt2       ( 472.0,  583.0);
  ps.p4 = new Pnt2       ( 562.0,  475.0);
  ps.p5 = new Pnt2       ( 392.0,  550.0);
}
else
  init1(ps);

//==================================================================
// Function 'get3rdVertex computes 'vertex3' which is
// A) at distance 'dist1' from 'vertex1',
// B) at distance 'dist2' from 'vertex2', and
// C) lies to the left of 'vertex2' when looking from 'vertex1'
//==================================================================

function get3rdVertex (vertex1, dist1, vertex2, dist2)
{
  var a = dist1;
  var b = dist2;
  var p = vertex1;
  var q = vertex2;
  var a2 = a*a;
  var b2 = b*b;
  var d = new Pnt2 (q.x-p.x, q.y-p.y);
  var h = new Pnt2(-d.y, d.x);
  var m = new Pnt2(0.5*(p.x+q.x), 0.5*(p.y+q.y));
  var d2 = d.x*d.x + d.y*d.y;
  var h2 = h.x*h.x + h.y*h.y;
  var x = (a2-b2) / (2*d2);
  var y = Math.sqrt ((a2 - (x+0.5)*(x+0.5)*d2) / h2);
  var rslt = new Pnt2 (m.x + x*d.x + y*h.x, m.y + x*d.y + y*h.y);
  return rslt;
}

function pointDist (a, b)
{
  var aMinusB = new Pnt2 (a.x-b.x, a.y-b.y);
  var rslt = Math.sqrt (aMinusB.x * aMinusB.x + aMinusB.y * aMinusB.y);
  return rslt;
}

function plotSeg (a, b, tag)
{
  // console.log("move " + a.x + " " + a.y + " " + tag);
  // console.log("     " + b.x + " " + b.y + " " + tag);
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function plotPointSet (ps, tag)
{
  plotSeg(ps.crankCtr, ps.crankEnd, tag);
  plotSeg(ps.crankEnd, ps.p1, tag);
  plotSeg(ps.crankEnd, ps.p2, tag);
  plotSeg(ps.p0, ps.p1, tag);
  plotSeg(ps.p0, ps.p2, tag);
  plotSeg(ps.p0, ps.p3, tag);
  plotSeg(ps.p1, ps.p3, tag);
  plotSeg(ps.p2, ps.p4, tag);
  plotSeg(ps.p2, ps.p5, tag);
  plotSeg(ps.p3, ps.p4, tag);
  plotSeg(ps.p4, ps.p5, tag);
  drawThickPoint(ps.crankCtr);
  drawThickPoint(ps.p0);
}

function drawPoint (p)
{
  // console.log (x + "  " + y + " " + label + " "  );
  ctx.fillRect(p.x,p.y, traceMarkSize, traceMarkSize);
}

function drawThickPoint (p)
{
  // console.log (x + "  " + y + " " + label + " "  );
  ctx.save();
  ctx.beginPath()
  ctx.fillStyle = fixedPointColor;
//  ctx.fillRect(p.x-1,p.y-1,3,3);
  ctx.arc(p.x,p.y, 0.5 * fixedPointSize, 0, 2*Math.PI);
  ctx.closePath()
  ctx.fill();
  ctx.restore();
}
function computeDistances() {
  crankRad = pointDist(ps.crankEnd, ps.crankCtr);
  dc1 = pointDist(ps.crankEnd, ps.p1);
  dc2 = pointDist(ps.crankEnd, ps.p2);
  d01 = pointDist(ps.p0, ps.p1);
  d02 = pointDist(ps.p0, ps.p2);
  d03 = pointDist(ps.p0, ps.p3);
  d13 = pointDist(ps.p1, ps.p3);
  d24 = pointDist(ps.p2, ps.p4);
  d25 = pointDist(ps.p2, ps.p5);
  d34 = pointDist(ps.p3, ps.p4);
  d45 = pointDist(ps.p4, ps.p5);
}

function calculateMotion (numSteps)
{
  var dRho = 2 * Math.PI / numSteps;

  computeDistances();

  trails = new Trails();

  for (var j=0; j<=numSteps; j++) {
    var rho = j * dRho;
    var r1  = new Pnt2 (Math.cos(rho), Math.sin(rho));
    var r1a = new Pnt2 (r1.x * crankRad, r1.y*crankRad);
    //...................... The moving point of the cranshaft:

    ps.crankEnd = new Pnt2(ps.crankCtr.x+r1a.x, ps.crankCtr.y+r1a.y);

    ps.p1 = get3rdVertex (ps.crankEnd, dc1,  ps.p0,  d01);
    ps.p2 = get3rdVertex (ps.p0,  d02,  ps.crankEnd, dc2);
    ps.p3 = get3rdVertex (ps.p1,  d13,  ps.p0, d03);
    ps.p4 = get3rdVertex (ps.p3,  d34,  ps.p2, d24);
    ps.p5 = get3rdVertex (ps.p4,  d45,  ps.p2, d25);
    // if ((j % 30) == 0)
    //   plotPointSet(ps, "ps" + j);

    var keys = Object.keys(trails);
    for (var i in keys) {
      var field = keys[i];
      trails[field].push(ps[field]);
    }
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  plotPointSet(ps, "redraw");
  Object.keys(vertexColors).forEach(function(key) {
    ctx.strokeStyle = vertexColors[key];
    ctx.fillStyle = vertexColors[key];
    trails[key].forEach(function(point) {
      drawPoint(point);
    });
  });
}

//===============================================================  Unit Test:

//drawMotion (ps, 100);
ctx.strokeStyle = 'red';
plotPointSet(ps, "Initial");

// Returns the vertex we're near or null
function mouseOnVertex(e) {
  actualX = e.clientX - offsetX;
  actualY = e.clientY - offsetY;
  var minX = actualX - clickSize;
  var maxX = actualX + clickSize;
  var minY = actualY - clickSize;
  var maxY = actualY + clickSize;
  var keys = Object.keys(ps);
  for (var i in keys) {
    var name = keys[i];
    var point = ps[name];
    if (point.x > minX && point.x < maxX && point.y > minY && point.y < maxY) {
      return point;
    }
  }
  return null;
}

canvas.onmousedown = function (e) {
  e.preventDefault();
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
  selectedVertex = mouseOnVertex(e);
  // var minX = startX - clickSize;
  // var maxX = startX + clickSize;
  // var minY = startY - clickSize;
  // var maxY = startY + clickSize;
  // var keys = Object.keys(ps);
  // for (var i in keys) {
  //   var name = keys[i];
  //   var point = ps[name];
  //   if (point.x > minX && point.x < maxX && point.y > minY && point.y < maxY) {
  //     //console.log('clicked on ' + name);
  //     selectedVertex = point;
  //   }
  // }
}

var mouseup = function (e) {
  if (selectedVertex != null) {
    //console.log('mouse up');
  }
  selectedVertex = null;
  window.location.hash = JSON.stringify(ps);
  calculateMotion(numTracePoints);
  redraw();
}

canvas.onmouseup = mouseup;
canvas.onmouseout = mouseup;

canvas.onmousemove = function (e) {
  if (selectedVertex == null) {
    // We're not dragging anything
    if (mouseOnVertex(e) != null) {
      // We're hovering near a vertex
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'auto';
    }
    return;
  }
  e.preventDefault();
  var dx = (e.clientX - offsetX) - startX;
  var dy = (e.clientY - offsetY) - startY;
  //console.log('dragging ' + dx + ' ' + dy);
  startX += dx;
  startY += dy;
  selectedVertex.x += dx;
  selectedVertex.y += dy;

  redraw();
}
  
function loadFromHash() {
  var hash = window.location.hash;
  //console.log(hash);
  if (hash == "") {
    return;
  }
  //remove leading hash char and parse;
  ps = JSON.parse(hash.substring(1));
  redraw();
}

loadFromHash();
calculateMotion(numTracePoints);
redraw();
