var PLAYER = {
  pos: null,
  movedir: null,
  center: null,
  mvMatrix: null,
  shader: null,
  numtri: null,
  attribs: {
    a_position: { buffer: null, numComponents: 3},
    a_normal: { buffer: null, numComponents: 3}
  },
  uniforms: {
    u_projection: null,
    u_model: null,
    u_view: null,
    u_color: [0.04136, 0.04136, 0.614],
    u_lightPos: [0.0, 0.0, 3.0]
  },
  init: function(shad,M,W) {
    this.shader = shad;
    verts = buildCube((W.width - W.thickness)/2.0,(W.height-W.thickness)/2.0,(W.width-W.thickness)/2.0);
    norms = buildCubeNorms();
    this.numtri = verts.length / 3;
    this.attribs.a_position.buffer = getBuffer(verts);
    this.attribs.a_normal.buffer = getBuffer(norms);

    sideln = W.width;
    //this.center = [sideln/2.0, sideln/2.0 - M.Nrows*sideln, sideln/2.0];
    this.pos = M.Ncols * (M.Nrows-1);
    this.moveCount = 0;
  },
  update: function(W, axis, proj, view) {
    step = 10;

    if (this.movedir > 0 && this.moveCount == 0 && axis != null && axis.x != null && axis.z != null)
    {
      dir = -1;
      lrc = M.getLRC(this.pos);
      switch (this.movedir) {
        case 1: //left
          dir = axis.x.multiply(-1);
          break;
        case 2: //up
          dir = axis.z;
          break;
        case 3: //right
          dir = axis.x;
          break;
        case 4: //down
          dir = axis.z.multiply(-1);
          break;
      }
      var i;
      var newpos;
      for (i=0; i<3; i++) {
        if (Math.abs(dir.elements[i])!=0)
          break;
      }
      switch (i) {
        case 0: //x
          newpos = M.index(lrc[0], lrc[1], lrc[2]+dir.elements[i]);
          break;
        case 1: //y
          newpos = M.index(lrc[0], lrc[1]+dir.elements[i]*-1, lrc[2]);
          break;
        case 2: //z
          newpos = M.index(lrc[0]+dir.elements[i], lrc[1], lrc[2]);
          break;
      }
      this.moveCount = step;
      this.pos = newpos;
    }
    else if (this.moveCount != 0) {
      this.moveCount += step;
      this.moveCount %= 60;
    }

    lrc = M.getLRC(this.pos);
    offset = W.width / 2.0;
    lay = lrc[0]; row = lrc[1]; col = lrc[2];
    width = W.width;

    this.center = [col*W.width+offset,(row+1)*width*-1+offset,lay*width+offset];

    wcenter = { mvMatrix: null }
    mvLoadIdentity(wcenter);
    mvTranslate([W.center[0]*-1,W.center[1]*-1,W.center[2]*-1],wcenter);

    mvLoadIdentity(this);
    mvTranslate([this.center[0],this.center[1],this.center[2]], this);

    this.mvMatrix = wcenter.mvMatrix.x(this.mvMatrix);
    this.mvMatrix = W.rotMat.mvMatrix.x(this.mvMatrix);
    Model.draw(this,proj,view);
  }
}
