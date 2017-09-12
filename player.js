var PLAYER = {
  pos: null,
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

    sideln = W.width - W.thickness;
    this.center = [sideln/2.0, -M.Nrows*W.width, 0.0];
  },
  update: function(mazeMat, proj, view) {
    mvLoadIdentity(this);
    mvTranslate([this.center[0]*-1,this.center[1]*-1,this.center[2]*-1], this);
    this.mvMatrix = mazeMat.x(this.mvMatrix);
    Model.draw(this,proj,view);
  }
}
