// Make sure that the points stay in place when recomputed from the distances.

function utGeom () {
  console.log ("============== Start utGeom"); 
  var psKeys = [ 'crankCtr', 'crankEnd', 'p0', 'p1', 'p2', 'p3', 'p4', 'p5'];
  init1(ps);
  var ps2 = Object.create(ps);
  console.log ("ps keyes: " + psKeys);

  computeDistances();
  calculatePoints (ps2);
  
  for (var p in ps) {
    var p1 = ps[p];
    var p2 = ps2[p];
//    console.log (" p1 = " + p1);
    var x1 = p1.x;
    var x2 = p2.x;
    var y1 = p1.y;
    var y2 = p2.y;
    var dx = x2-x1;
    var dy = y2-y1;
    var ds2 = dx*dx + dy*dy;
    console.log("["+p+"]: (" + x1+","+y1+" vs. " + x2+","+y2);
    console.log ("ds[" + p + "] = " + Math.sqrt(ds2));
  }
}

utGeom ();
