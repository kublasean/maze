/*------ functions common to renderable objects (models) ------*/

var Model = {

objectTransforms: function(model) {
  mvTranslate(model.translation[1], model);
  model.rotation[1].forEach(function(rot,i,arr) { mvRotate(rot[0], rot[1], model)});
  mvTranslate(model.translation[0], model);
  model.rotation[0].forEach(function(rot,i,arr) { mvRotate(rot[0], rot[1], model)});
  mvScale2(model.scale_arr, model);
  mvScale(model.scale, model);
  mvTranslate([model.center[0]*-1, model.center[1]*-1, model.center[2]*-1], model);
},

applyTranformation: function(model) {
  if (model.verts.length != model.norms.length)
    return;
  for (var i=0; i<model.verts.length; i++) {
    model.verts[i] = (model.mvMatrix.multiply(Matrix.create([model.verts[0],model.verts[1],model.verts[2],1]))).flatten.slice(0,3);
    model.norms[i] = (model.mvMatrix.multiply(Matrix.create([model.norms[0],model.norms[1],model.norms[2],1]))).flatten.slice(0,3);
  }
  model.attribs.a_position.buffer = getBuffer(model.verts);
  model.attribs.a_normal.buffer = getBuffer(model.norms);
},

draw: function(model, proj, view) {
  gl.useProgram(model.shader.program);

  model.uniforms.u_projection = new Float32Array(proj.flatten());
  model.uniforms.u_view = new Float32Array(view.flatten());
  //model.uniforms.u_camera = new Float32Array(camera.getMatrix().flatten());

  //mvLoadIdentity(model);
  //Model.objectTransforms(model);
  //Model.applyTranformation(model);
  //mvLoadIdentity(model);

  model.uniforms.u_model = new Float32Array(model.mvMatrix.flatten());

  setUniforms(model.shader.uniformSetters, model.uniforms);
  setAttributes(model.shader.attribSetters, model.attribs);

  if (model.points)
    gl.drawArrays(gl.LINE_STRIP, 0, model.numtri);
  else
  gl.drawArrays(gl.TRIANGLES, 0, model.numtri);
},

updateActions: function(model) {
  for (var i=0; i<model.updateList.length; i++) {
    if(model.updateList[i](model)) {
      model.updateList.splice(i,1);
      i--;
    }
  }
  return model.updateList.length;
},

updateWorldPosition: function(model) {
  //mvLoadIdentity(model);
  //console.log(model.center);
  //Model.objectTransforms(model);
  center = [model.center[0],model.center[1],model.center[2],1];
  var worldPosition = model.mvMatrix.multiply(Matrix.create(center));
  //console.log(worldPosition);
  return worldPosition.flatten().slice(0,3);
},

updateTranslation: function(model) {
  var prod = model.velocity.multiply(model.delta).elements;
  model.translation[0][0] += prod[0];
  model.translation[0][1] += prod[1];
},

touching: function(model, other) {
  var a = model.position;
  var b = other.position;
  var dist = b.distanceFrom(a);
  if (dist < model.radius*model.scale + other.radius*other.scale)
    return true;
 return false;
},

newModel: function() {
  var mod = {
    mvMatrix:     null,
    translation:  [[0,0,0],[0,0,0]],
    rotation:     [ [[0,[1,0,0]], [0,[1,0,0]]], [[0,[0,0,1]]] ],
    scale:        1,
    scale_arr:    [1,1,1],
    center:       [0,0,0,1]
  }
  return mod;
}

}


function buildCubeNorms() {
  var norms = [
    0,0,1,
    0,0,1,
    0,0,1,
    0,0,1,
    0,0,1,
    0,0,1,

    0,0,-1,
    0,0,-1,
    0,0,-1,
    0,0,-1,
    0,0,-1,
    0,0,-1,

    -1,0,0,
    -1,0,0,
    -1,0,0,
    -1,0,0,
    -1,0,0,
    -1,0,0,

    1,0,0,
    1,0,0,
    1,0,0,
    1,0,0,
    1,0,0,
    1,0,0,

    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,

    0,-1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0
  ];
  return norms;
}
function buildCube(x, y, z) {
                    // Set up the verticies
                    var verts = [
                        //x  y   z
                        // Top
                        -x,  y,  z,
                         x,  y,  z,
                        -x, -y,  z,

                         x,  y,  z,
                         x, -y,  z,
                         -x, -y, z,


                        // Bottom
                         x,  y, -z,
                        -x,  y, -z,
                         x, -y, -z,
                         -x,  y, -z,
                        -x, -y, -z,
                        x, -y, -z,


                        // Left
                        -x,  y, -z,
                        -x,  y,  z,
                        -x, -y, -z,

                        -x,  y,  z,
                        -x, -y,  z,
                        -x, -y, -z,

                        // Right
                         x,  y,  z,
                         x,  y, -z,
                         x, -y,  z,

                         x,  y,  -z,
                         x, -y, -z,
                         x,  -y, z,

                        // Front
                        -x,  y,  z,
                         x,  y,  z,
                        -x,  y, -z,
                        x,  y,  z,
                         x,  y, -z,
                         -x,  y,  -z,

                        // Back
                         x, -y,  z,
                        -x, -y,  z,
                         x, -y, -z,
                         -x, -y,  z,
                        -x, -y, -z,
                        x, -y,  -z
                    ];
                    return verts;
                  }
