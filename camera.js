function Camera (pos) {
  this.lookAt = [0,0,0];
  this.position = pos;
  var base = pos;
  var firsttime = true;
  var offset = 20.0;
  var rotx = 0;
  var rotz = 0;

  this.update = function() {
    var step = 0.10;
    var rotStep = 4;
    //up
    if (keys[38]) {
      //rotx += rotStep;
      W.rotUpDown = -1;
			FW.rotUpDown = -1;
    }
    //left
    if (keys[37]) {
      //rotz += rotStep;
      W.rotLeftRight = -1;
			FW.rotLeftRight = -1;
    }
    //right
    if (keys[39]) {
      //rotz -= rotStep;
      W.rotLeftRight = 1;
			FW.rotLeftRight = 1;
    }
    //down
    if (keys[40]) {
      W.rotUpDown = 1;
			FW.rotUpDown = 1;
    }

    //space (tmp reset key)
    if (keys[32]) {
      return true;
    }

    if (rotx > 360)
      rotx = 1;
    if (rotx < 0)
      rotx = 359;

    if (rotz < 0)
      rotz = 359;
    if (rotz > 360) {
      rotz = 1;
    }

    var move = $V([0,0,0]);
    var mrx = Matrix.Rotation(rotx*Math.PI/180.0, $V([1,0,0])).ensure4x4();
    var mrz = Matrix.Rotation(rotz*Math.PI/180.0, $V([0,0,1])).ensure4x4();
    var ma = Matrix.Rotation(270*Math.PI/180.0, $V([0,0,1])).ensure4x4();

    var tmp = mrx.x($M([0,GC.lookat,0,1]));
    tmp = mrz.x(tmp);
    var right = $V(ma.x(tmp).flatten().slice(0,3)).toUnitVector();
    right.elements[2] = 0;
    var dir = tmp.flatten().slice(0,3);
    dir = $V(dir).toUnitVector();
    //a arrow
    PLAYER.movedir = 0;
    if (keys[65]) {
      //move = move.add(right.multiply(-step));
      PLAYER.movedir = 1;
    }
    //w arrow
    if (keys[87]) {
      //move = move.add(dir.multiply(step));
      PLAYER.movedir = 2;
    }
    //d arrow
    if (keys[68]) {
      //move = move.add(right.multiply(step));;
      PLAYER.movedir = 3;
    }
    //s arrow
    if (keys[83]) {
      //move = move.add(dir.multiply(step*-1));
      PLAYER.movedir = 4;
    }

    //var sc = GC.test;
    //var newPos = [sc*move.elements[0]+this.position[0],sc*move.elements[1]+this.position[1],sc*move.elements[2]+this.position[2]];
    //var newPos = [this.base[0], this.base[1] + ]
    if (PLAYER.wp != null) {
      if (firsttime == true) {
        offset = PLAYER.wp[1] - base[1];
        firsttime = false;
      }
      var goal = PLAYER.wp[1] - offset;
      var diff = goal - this.position[1];
      if (Math.abs(diff) > 0.5) {
        this.position[1] += diff * 0.25;
      }
    }

    //this.position = newPos;

    var mt = Matrix.Translation($V(this.position)).ensure4x4();

    tmp = mt.x(tmp);
    this.lookAt = tmp.flatten().slice(0,3);
    return false;
  }
}

function lrcFromWorld(pos) {
  var w = 5.0;
  var l, r, c;
  l = Math.floor(pos[2] / w);
  r = Math.floor((pos[1]*-1) / w);
  c = Math.floor(pos[0] / w);
  return [l,r,c];
}
function positionOkay(oldPos, newPos) {
  return !(M.map.has(strwall(oldPos,newPos)));
}
