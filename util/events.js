
function updateKeys() {

  var v = [];

  //left arrow
  if (keys[65]) {
    v[0] = -1;
  }
  //up arrow
  if (keys[87]) {
    v[1] = 1;
  }
  //right arrow
  if (keys[68]) {
    v[0] = 1;
  }
  //down arrow
  if (keys[83]) {
    v[1] = -1;
  }

  if (v[0] && v[1]) {
    v[0] /= 2.0;
    v[1] /= 2.0;
  }

}


/************* EVENT CALLBACKS ******************/

//window resize
windowResize = function() {
  GC.windowX = window.innerWidth;
  GC.windowY = window.innerHeight;
}

setMouseEventCallbacks = function(canvas){
    //-------- set callback functions
    canvas.onmousedown = mouseDown;
    canvas.onmousewheel = mouseWheel;

    document.onmouseup = mouseUp;
    document.onmousemove = mouseMove;
}

//handle mousedown
mouseDown = function(event) {
    GC.mouseDown = true;
    GC.mouseX = event.clientX;
    GC.mouseY = event.clientY;
    return false;
}

//handle mouseup
mouseUp = function(event){
    GC.mouseDown = false;
    return false;
}

//handle mouse movement
mouseMove = function(event) {
     GC.mouseX = event.clientX;
     GC.mouseY = event.clientY;

    return false;
}

//handle mouse scroll event
mouseWheel = function(event){
    GC.zoom -= event.wheelDeltaY*0.00005;
    return false;
}


//--------- handle keyboard events
keyDown = function(e){
  keys[e.keyCode] = 1;
}
keyUp = function(e){
  keys[e.keyCode] = 0;

}
