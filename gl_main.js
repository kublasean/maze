/* globals, GC, init, and the main loop (drawScene) */
var GC = {};
var keys = [];
var camera = null;
var shader2D;
var M = null; 

//graphics context variables
GC.mouseDown = false;
GC.width = null;
GC.height = null;
GC.near = 0.001;
GC.far = 200;
GC.zoom = 1.0;
GC.fps = 60;
GC.time = 0;
GC.test = 3;
GC.fov = 45;
GC.lookat = 1;
GC.u_lightPos = [0, 0, 0];
GC.u_color = [0.1, 0.1, 0.1];
 
function exitScene() {
    clearInterval(GC.game);
    newRound(M.Nrows+1);
}
function newRound(N) {
    M = Maze.construct(N,N,N);
    beginDemo()
}

function beginDemo() {
    shaderBUN = new Shader("VertexShader_BUN", "FragmentShader_BUN");
    shaderWALL = new Shader("VertexShader_WALL", "FragmentShader_WALL");
    
    Walls.construct(shaderWALL, 5.0,5.0,1.0);
    
    console.log(Walls);

    PLAYER.init(shaderBUN,M,Walls);
    camera = new Camera([0, -Walls.width*M.Nrows+(M.Nrows-1)*-Walls.width, 0.0]);
    //camera = new Camera([-100,-100,0]);

    //setup event callbacks
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    window.onresize = windowResize;
    setMouseEventCallbacks(gl.canvas);

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    mvLoadIdentity(Walls.rotMat);
    console.log(Walls);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    GC.game = setInterval(drawScene, 1000.0 / GC.fps);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    canvasResize();
    GC.time += 0.001;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (camera.update()) {
        exitScene();
        return;
    }

    var proj = makePerspective(GC.fov, GC.width / GC.height, GC.near, GC.far);
    var view = makeLookAt(camera.position[0],camera.position[1],camera.position[2],
    camera.lookAt[0],camera.lookAt[1],camera.lookAt[2],
    0,0,1);

    var axis = Walls.rotate();
    PLAYER.update(Walls, axis, proj, view);
    Walls.update(axis, proj, view, PLAYER.pos);
    

    
}
