/* globals, GC, init, and the main loop (drawScene) */
var gl = null;
var GC = {};
var keys = [];
var camera = null;
//var camera = new ArcBall();
var shader2D;
var M = null; //maze
var W = null; //wall

//graphics context variables
GC.mouseDown = false;
GC.width = null;
GC.height = null;
GC.near = 0.001;
GC.far = 200;
GC.zoom = 1.0;
GC.fps = 30;
GC.time = 0;
GC.test = 3;
GC.fov = 45;
GC.lookat = 1;

function main(glcontext, N) {
  gl = glcontext;
  M = mazemake(N,N,N);
  //load files/images
  beginDemo();
}

function beginDemo() {
  shader2D  = new Shader("VertexShader2D", "FragmentShader2D");
  shaderBUN = new Shader("VertexShader_BUN", "FragmentShader_BUN");

  W = new Wall(shaderBUN, 5.0,5.0,0.10);
  F = new Wall(shaderBUN, 5.0,5.0,0.01);
  F.uniforms.u_color = [0.04136, 0.04136, 0.614];
  F.rotation[0][0][0] = 0;
  F.translation[0] = [F.width/2.0+(M.Ncols-1)*F.width,F.width/-2.0,-F.thickness];
  mazeinit(W);

  //setup camera
  camera = new Camera([W.width/2.0, -W.width/2.0+(M.Nrows-1)*-W.width, 0.8]);
  //setup event callbacks
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  window.onresize = windowResize;
  setMouseEventCallbacks(gl.canvas);

  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);

  GC.game = setInterval(drawScene, 1000.0 / GC.fps);
  canvasResize();
}

function drawScene() {

  canvasResize();
  GC.time += 0.001;

  camera.update();
  var proj = makePerspective(GC.fov,GC.width / GC.height, GC.near, GC.far);
  var view = makeLookAt(camera.position[0],camera.position[1],camera.position[2],
    camera.lookAt[0],camera.lookAt[1],camera.lookAt[2],
    0,0,1);

  Model.draw(W, proj, view);
  Model.draw(F, proj, view);
}

function drawwall(w, proj, view) {
  for (var i=0; i<w.transforms.length; i++) {
    w.translation[0] = w.transforms[i].trans;
    w.rotation[0][1][0] = w.transforms[i].rotx;
    w.rotation[0][0][0] = w.transforms[i].rotz;
    w.scale_arr = w.transforms[i].sc;
    Model.draw(W, proj, view);
  }
}
