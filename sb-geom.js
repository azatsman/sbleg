var numTracePoints = 200;

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
  init1(this);
};

var ps = new PointSet();

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

// Compute five points from three (crankCtr, crankEnd, p0) :


function calculatePoints (p) {
  if (false) {
    p.p1 = get3rdVertex (p.crankEnd, dc1,  p.p0,  d01);
    p.p2 = get3rdVertex (p.p0,  d02,  p.crankEnd, dc2);
    p.p3 = get3rdVertex (p.p1,  d13,  p.p0, d03);
    p.p4 = get3rdVertex (p.p3,  d34,  p.p2, d24);
    p.p5 = get3rdVertex (p.p4,  d45,  p.p2, d25);
  } 
  else {
    p.p1 = get3rdVertex (p.p0,  d01, p.crankEnd, dc1);
    p.p2 = get3rdVertex (p.crankEnd, dc2, p.p0,  d02);
    p.p3 = get3rdVertex (p.p0, d03, p.p1,  d13);
    p.p4 = get3rdVertex (p.p2, d24, p.p3,  d34);
    p.p5 = get3rdVertex (p.p2, d25, p.p4,  d45);
  }
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
    
    calculatePoints (ps);

    var keys = Object.keys(trails);
    for (var i in keys) {
      var field = keys[i];
      trails[field].push(ps[field]);
    }
  }
}
