/* utility functions
 gl arguments - optional if not globally defined */

//should be called before every drawScene if the canvas size is dynamic
function canvasResize() {
  var canvas = gl.canvas;
  var w, h;
  
  h = canvas.clientHeight;
  w = canvas.clientWidth;
  
  if (canvas.height != h || canvas.width != w) {
    canvas.height = h;
    canvas.width = w;
    gl.viewport(0,0, w, h);
  }
  
  //update graphics context if present
  if (GC) {
    GC.height = h;
    GC.width = w;
  }
}

//returns a shader program 
//argments = names of shaders in document
function createProgramFromScripts(vert, frag) {
	var fragmentShader = getShader(frag);
	var vertexShader = getShader(vert);
	
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log(name + "unable to init shader program");
	}
	
	return shaderProgram;
}


//compile shader located within a script tag
function getShader(id){
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);
    if(!shaderScript){
        return null;
    }

    //init the source code variable
    theSource = "";

    //begin reading the shader source from the beginning
    currentChild = shaderScript.firstChild;

    //read the shader source as text
    while(currentChild){
        if(currentChild.nodeType == currentChild.TEXT_NODE){
            theSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    //check type of shader to give openGL the correct hint
    if(shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if(shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    
    //add the shader source code to the created shader object
    gl.shaderSource(shader, theSource);

    //compile the shader
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.log("error compiling shaders -- " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function getBuffer(ls) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ls), gl.STATIC_DRAW);
	return buf;
}