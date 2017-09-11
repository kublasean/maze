function Camera (pos) {
  this.lookAt = [0,0,0];
  this.position = pos;
  var rotx = 0;
  var rotz = 0;

  this.update = function() {
    var step = 0.10;
    var rotStep = 4;
    //up
    if (keys[38]) {
      //rotx += rotStep;
      W.rotUpDown = -1;
    }
    //left
    if (keys[37]) {
      //rotz += rotStep;
      W.rotLeftRight = -1;
    }
    //right
    if (keys[39]) {
      //rotz -= rotStep;
      W.rotLeftRight = 1;
    }
    //down
    if (keys[40]) {
      W.rotUpDown = 1;
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
    if (keys[65]) {
      move = move.add(right.multiply(-step));;
    }
    //w arrow
    if (keys[87]) {
      move = move.add(dir.multiply(step));
    }
    //d arrow
    if (keys[68]) {
      move = move.add(right.multiply(step));;
    }
    //s arrow
    if (keys[83]) {
      move = move.add(dir.multiply(step*-1));
    }

    var sc = GC.test;
    var newPos = [sc*move.elements[0]+this.position[0],sc*move.elements[1]+this.position[1],sc*move.elements[2]+this.position[2]];
  ///  if (positionOkay(this.position, newPos)) {
      this.position = newPos;
  //  }
  //  else {
    //  console.log("positionOkay == false");
    //}
    var mt = Matrix.Translation($V(this.position)).ensure4x4();

    tmp = mt.x(tmp);
    this.lookAt = tmp.flatten().slice(0,3);
    return false;
  }
}

/*---check if running into wall---*/
function insideWall(oldCell, newCell, adjCell) {
  return M.map.has(strwall(oldCell,adjCell)) && newCell == adjCell;
}
function checkAdjWalls(l,r,c,oldCell,newCell) {
  if (insideWall(oldCell, newCell, M.index(l-1,r,c)))
    return false;
  if (insideWall(oldCell, newCell, M.index(l+1,r,c)))
    return false;
  if (insideWall(oldCell, newCell, M.index(l,r-1,c)))
    return false;
  if (insideWall(oldCell, newCell, M.index(l,r+1,c)))
    return false;
  if (insideWall(oldCell, newCell, M.index(l,r,c-1)))
    return false;
  if (insideWall(oldCell, newCell, M.index(l,r,c+1)))
    return false;
  return true;
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
  var old_lrc = lrcFromWorld(oldPos);
  var new_lrc = lrcFromWorld(newPos);

  if (!(-1<new_lrc[0] && -1<new_lrc[1] && -1<new_lrc[2]
  && new_lrc[0]<M.Nlayers && new_lrc[1]<M.Nrows && new_lrc[2]<M.Ncols)) {
    console.log("outofbounds");
    return false;
  }

  var old_i = M.index(old_lrc[0], old_lrc[1], old_lrc[2]);
  var new_i = M.index(new_lrc[0], new_lrc[1], new_lrc[2]);

  return checkAdjWalls(old_lrc[0], old_lrc[1], old_lrc[2], old_i, new_i);
}
