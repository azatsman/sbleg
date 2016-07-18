
var lineWidth = 3;
var traceMarkSize = 2;

var fixedPointSize = 12;
var fixedPointColor = 'green';
var movingPointSize = 12;
var movingPointColor = 'blue';

var canvas = document.getElementById('sbcanvas')
var ctx = canvas.getContext("2d");
var clickSize = 12;

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
  drawThickPoint(ps.crankCtr, fixedPointSize, fixedPointColor);
  drawThickPoint(ps.p0,       fixedPointSize, fixedPointColor);

  drawThickPoint(ps.p1, movingPointSize, movingPointColor);
  drawThickPoint(ps.p2, movingPointSize, movingPointColor);
  drawThickPoint(ps.p3, movingPointSize, movingPointColor);
  drawThickPoint(ps.p4, movingPointSize, movingPointColor);
  drawThickPoint(ps.p5, movingPointSize, movingPointColor);
  
}

function drawPoint (p)
{
  // console.log (x + "  " + y + " " + label + " "  );
  ctx.fillRect(p.x,p.y, traceMarkSize, traceMarkSize);
}

function drawThickPoint (p, pSize, pColor)
{
  // console.log (x + "  " + y + " " + label + " "  );
  ctx.save();
  ctx.beginPath()
  ctx.fillStyle = pColor;
//  ctx.fillRect(p.x-1,p.y-1,3,3);
  ctx.arc(p.x,p.y, 0.5 * pSize, 0, 2*Math.PI);
  ctx.closePath()
  ctx.fill();
  ctx.restore();
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

canvas.onmouseup  = mouseup;
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

function computeCanvasOffset ()
{
  offsetX = 0;
  offsetY = 0;
  var currentElement = canvas;
  do{
    offsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    offsetY += currentElement.offsetTop - currentElement.scrollTop;
  }
  while(currentElement = currentElement.offsetParent)
  
  console.log ("Canvas XY : " + offsetX + "," + offsetY);

}

function onResetButton ()
{
  console.log ("About to reset");
  init1(ps);
  calculateMotion(numTracePoints);
  redraw();
}


loadFromHash();
computeCanvasOffset ();
calculateMotion(numTracePoints);
redraw();
