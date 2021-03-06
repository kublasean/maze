Walls = {

rotUpDown: 0,
rotLeftRight: 0,
rotUD: 0,
rotLR: 0,
rotMat: { mvMatrix:null },
shader: null,
flat: null,
side: null,
all: null,
width: null,
height: null,
thickness: null,
center: null,

getShell: function(lrc) {
    for (var i=0; i<M.Nrows/2; i++) {
        for (var j=0; j<3; j++) {
            if (lrc[j] == i || lrc[j] == M.Nrows-1-i) {
                return i;
            }
        }
    }
    return 0;
},

//relies on the global M to be a maze object    
construct: function(shader,x,y,z) {
    var dummy = Model.newModel();
    var walls;
    this.shader = shader;
    this.width = x;
    this.height = y;
    this.thickness = z;

    dummy.verts = Model.getCubeVerts((x+z)/2.0,(y+z)/2.0,z/2.0);
    dummy.norms = Model.getCubeNorms();
    dummy.rotation =     [ [[90,[1,0,0]], [0,[0,1,0]], [0,[0,0,1]]], [[0,[0,0,1]]] ];
    
    this.center = [M.Ncols*x/2.0,M.Nrows*x/-2.0,M.Nlayers*x/2.0];
    this.setwalls(x,y,dummy);

    //fW.uniforms.u_color = [108.0/255.0, 204.0/255.0, 200.0/255.0];
},

newWallLayer: function(depth,w) {
    var wl = Model.newModel();
    wl.verts = [];
    wl.norms = [];
    wl.type = [];
    wl.depth = depth;
    wl.center = [M.Ncols*w/2.0,M.Nrows*w/-2.0,M.Nlayers*w/2.0];
    wl.uniforms = { u_color: [108.0/255.0, 204.0/255.0, 200.0/255.0, 1.0] }
    return wl;
},

setwalls: function(width,height,wallModel) {
    var shells = [];
    for (var i=0; i<M.Nrows / 2; i++) {
        shells.push( this.newWallLayer(i, width) );
    }
            
    for (var i=0; i<M.walls.length; i++) {
        var a = M.walls[i].a;
        var b = M.walls[i].b;
        var t = {};
        var row, col, lay;
        var lrc = M.getLRC(a);
        lay = lrc[0];
        row = lrc[1];
        col = lrc[2];

        t.trans = [col*width,row*width*-1,lay*width];
        t.rotx = 0;
        t.rotz = 0;
        t.x = a;
        t.y = b;
        t.lrcX = [lay, row, col];
        t.lrcY = M.getLRC(b);
        
        switch (b) {
            case M.getIndex(lay-1, row, col):
                t.rotx = 0;
                t.rotz = 0;
                t.trans[0] += width/2.0;
                t.trans[1] += width/-2.0;
                t.trans[2] += 0;
                break;
            case M.getIndex(lay+1, row, col):
                t.rotx = 0;
                t.rotz = 0;
                t.trans[0] += width/2.0;
                t.trans[1] += width/-2.0;
                t.trans[2] += width;
                break;
            case M.getIndex(lay, row-1, col):
                t.rotx = 0;
                t.rotz = 90;
                t.trans[0] += width/2.0;
                t.trans[1] -= 0;
                t.trans[2] += width/2.0;
                break;
            case M.getIndex(lay, row+1, col):
                t.rotx = 0;
                t.rotz = 90;
                t.trans[0] += width/2.0;
                t.trans[1] -= width;
                t.trans[2] += width/2.0;
                break;
            case M.getIndex(lay, row, col-1):
                t.rotx = 90;
                t.rotz = 90;
                t.trans[0] += 0;
                t.trans[1] += width/-2.0;
                t.trans[2] += width/2.0;
                break;
            case M.getIndex(lay, row, col+1):
                t.rotx = 90;
                t.rotz = 90;
                t.trans[0] += width;
                t.trans[1] += width/-2.0;
                t.trans[2] += width/2.0;
                break;
            default:
                console.log("ERROR not adjacent");
                break;
        }
                
        //set the transforms to be applied for this wall 
        wallModel.rotation[0][0][0] = t.rotz;
        wallModel.rotation[0][1][0] = t.rotx;
        wallModel.translation[1] = t.trans;
        mvLoadIdentity(wallModel);
        Model.objectTransforms(wallModel);

        var limits = [M.Nlayers-1, M.Nrows-1, M.Ncols-1];
        var alrc = M.getLRC(a);
        var blrc = M.getLRC(b);

        var k = Math.min(this.getShell(alrc), this.getShell(blrc));
        var same = false;
        if (this.getShell(alrc) == this.getShell(blrc)) {
            same = true;
        }
        for (var j=0; j<wallModel.verts.length; j+=3) {
            var v = wallModel.mvMatrix.x($M([wallModel.verts[j],wallModel.verts[j+1],wallModel.verts[j+2],1.0])).flatten().slice(0,3);
            var n = wallModel.mvMatrix.x($M([wallModel.norms[j],wallModel.norms[j+1],wallModel.norms[j+2],0.0])).flatten().slice(0,3);
            shells[k].verts.push(v[0],v[1],v[2]);
            shells[k].norms.push(n[0],n[1],n[2]);

            if (j >= 3 * 6 * 2) {
                shells[k].type.push(0);
            }
            else {
                shells[k].type.push(1);
            }
        }
    }
    
    for (var i=0; i<shells.length; i++) {
        var all = shells[i];
        all.attribs = { 
                a_position: { buffer: getBuffer(all.verts), numComponents: 3 },
                a_normal: { buffer: getBuffer(all.norms), numComponents: 3 },
                a_type: { buffer: getBuffer(all.type), numComponents: 1}
        }
        all.shader = this.shader;
        all.numtri = all.verts.length / 3;
    }
 
    this.shells = shells;
},

// rotate the maze, return new orientation
rotate: function() {
    var rotmv = this.rotMat.mvMatrix;
    var xaxis = null;
    var zaxis = null;
    var step = 5;
    var axis = null;

    function applyTrans(arr) {
        a = [arr[0],arr[1],arr[2],1];
        b = rotmv.multiply(Matrix.create(a));
        return b.flatten().slice(0,3);
    }

    //make an axis and apply the current rot matrix
    for (var i=0; i<3; i++) {
        tmp = $V([0,0,0]);
        tmp.elements[i] = 1;
        res = applyTrans(tmp.elements);
        if (Math.abs(Math.abs(res[0])-1.0) < 0.01) {
            if (res[0] < 0) {
              tmp = tmp.multiply(-1);
            }
            xaxis = tmp;
        }
        else if (Math.abs(Math.abs(res[2])-1.0) < 0.01) {
            if (res[2] < 0) {
              tmp = tmp.multiply(-1);
            }
            zaxis = tmp
        }
    }

    /*if (xaxis == null || zaxis == null) {
        console.log('ERROR: Walls.rotate()');
        return;
    }*/

    //console.log(this.rotUD, this.rotLR);

    if (this.rotUpDown != 0 && this.rotLR == 0) {
        axis = xaxis;
        this.rotUD += step * this.rotUpDown;
        step *= this.rotUpDown;
    }
    else if (this.rotLeftRight != 0 && this.rotUD == 0) {
        axis = zaxis;
        this.rotLR += step * this.rotLeftRight;
        step *= this.rotLeftRight;
    }
    else {
        axis = $V([1,0,0]);
        step = 0;
    }

    //mvLoadIdentity(this);
    //mvTranslate([this.center[0]*-1,this.center[1]*-1,this.center[2]*-1], this);
    mvRotate(step, axis.elements, this.rotMat);

    //this.mvMatrix = this.rotMat.mvMatrix.x(this.mvMatrix);

    if (this.rotLR % 90 == 0) {
        this.rotLR = 0;
        this.rotLeftRight = 0;
    }
    if (this.rotUD % 90 == 0) {
        this.rotUD = 0;
        this.rotUpDown = 0;
    }
    return {x: xaxis, z: zaxis}
},

update: function(axis, proj, view, player_pos) {  
    var shell = this.getShell(M.getLRC(player_pos));
    var alpha = 0.2;

    for (var i=this.shells.length-1; i>=0; i--) {
        var drawMe = this.shells[i];
        drawMe.uniforms.u_lightPos = GC.u_lightPos;
        //drawMe.uniforms.u_color[0] = 1.0*i/this.shells.length / 2.0;
        //drawMe.uniforms.u_color[1] = 1.0*i/this.shells.length / 2.0;
        //drawMe.uniforms.u_color[2] = 1.0*i/this.shells.length / 2.0;
        
        if (i >= shell) {
            drawMe.uniforms.u_color[3] = 1;
        }
        else {
            drawMe.uniforms.u_color[3] = alpha;
        }
        mvLoadIdentity(drawMe);
        mvTranslate([drawMe.center[0]*-1, drawMe.center[1]*-1, drawMe.center[2]*-1], drawMe);
        drawMe.mvMatrix = this.rotMat.mvMatrix.x(drawMe.mvMatrix);
        Model.draw(drawMe, proj, view);

        if (i < shell) {
            break;
        }
    }
}

}