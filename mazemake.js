function strwall(x,y) {
  if (x<y) {
    return x.toString().concat(" ").concat(y.toString());
  }
  else {
    return y.toString().concat(" ").concat(x.toString());
  }
}

function adj(nl,nr,nc) {
  //this.Nrows = nr;
  //this.Ncols = nc;
  //this.Nlayers = nl;
  //var nl = l;
  //var nr = r;
  //var nc = c;

  this.find = function(i) {
    var v = [];
    var row, col, lay;
    lay = Math.floor(i / (nc*nr));
    var ii = i-lay*nr*nc;
    row = Math.floor(ii / nc);
    col = ii-row*nc;

    function subfind(l,r,c) {
      if (-1<l && -1<r && -1<c && l<nl && r<nr && c<nc) {
        v.push(l*nr*nc+r*nc+c);
      }
    }

    //check adjacencies
    subfind(lay-1, row, col);
    subfind(lay+1, row, col);
    subfind(lay, row-1, col);
    subfind(lay, row+1, col);
    subfind(lay, row, col-1);
    subfind(lay, row, col+1);

    return v;
  }
}

function mazemake(nl, nr, nc, width) {
  var Ncells = nr * nc * nl;
  var cells = new dset(Ncells);
  var nearby_cells = new adj(nl, nr, nc);

  var walls = new Map();
  for (var i=0; i<Ncells; i++) {
    var v = nearby_cells.find(i);
    for (var j=0; j<v.length; j++) {
      var w = strwall(i,v[j]);
      walls.set(w,true);
    }
  }

  while (cells.size()>1) {
    var cell = getRandomInt(0,Ncells);
    var v = nearby_cells.find(cell);
    var adj_cell = v[getRandomInt(0,v.length)];

    if (cells.find(cell)!=cells.find(adj_cell)) {
      cells.merge(cell, adj_cell);
      var w = strwall(cell, adj_cell);
      walls.delete(w);
    }
  }

  var mazeWalls = [];
  walls.forEach( function(val, key, map) {
    var w = {};
    var arr = key.split(' ');
    w.x = parseInt(arr[0]);
    w.y = parseInt(arr[1]);
    mazeWalls.push(w);
  });

  var newmaze = {
    map: walls,
    walls: mazeWalls,
    Nrows: nr,
    Ncols: nc,
    Nlayers: nl,
    getLRC: function(i) {
      var lay, row, col;
      lay = Math.floor(i / (nc*nr));
      ii = i-lay*nr*nc;
      row = Math.floor(ii / nc);
      col = ii-row*nc;
      return [lay,row,col];
    },
    index: function(l,r,c) {
      return l*nc*nr + r*nc + c;
    }
  }
  return newmaze;
}

function Wall (shader,x,y,z) {
  this.shader =       shader;
  this.mvMatrix =     null;
  this.translation =  [[0,0,0],[0,0,0]];
  this.rotation =     [ [[90,[1,0,0]], [0,[0,1,0]], [0,[1,0,0]]], [[0,[0,0,1]]] ];
  this.scale =        1;
  this.scale_arr =    [1,1,1];
  this.center =       [0,0,0];
  this.thickness = z;
  this.height = y;
  this.width = x;
  //holds positions&orientations of walls to be drawn
  this.transforms = [];

  this.verts = buildCube((x+z)/2.0,(y+z)/2.0,z/2.0);
  this.norms = buildCubeNorms();

  this.numtri = this.verts.length / 3;

  this.attribs = {
    a_position: { buffer: getBuffer(this.verts), numComponents: 3 },
    a_normal: { buffer: getBuffer(this.norms), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_view: null,
    u_color: [0.614, 0.04136, 0.04136],
    u_lightPos: [0.0, 0.0, 3.0]
  }
}

function setwall(i,j,width,height) {
  var t = {};
  var row, col, lay;

  var lrc = M.getLRC(i);
  lay = lrc[0];
  row = lrc[1];
  col = lrc[2];

  t.trans = [col*width,row*width*-1,lay*width];
  t.rotx = 0;
  t.rotz = 0;
  t.sc = [1,1,1];
  t.x = i;
  t.y = j;
  t.lrcX = [lay, row, col];
  t.lrcY = M.getLRC(j);

  switch (j) {
    case M.index(lay-1, row, col):
      t.rotx = 0;
      t.rotz = 0;
      t.trans[0] += width/2.0;
      t.trans[1] += width/-2.0;
      t.trans[2] += 0;
      break;
    case M.index(lay+1, row, col):
      t.rotx = 0;
      t.rotz = 0;
      t.trans[0] += width/2.0;
      t.trans[1] += width/-2.0;
      t.trans[2] += width;
      break;
    case M.index(lay, row-1, col):
      t.rotx = 0;
      t.rotz = 90;
      t.trans[0] += width/2.0;
      t.trans[1] -= 0;
      t.trans[2] += width/2.0;
      break;
    case M.index(lay, row+1, col):
      t.rotx = 0;
      t.rotz = 90;
      t.trans[0] += width/2.0;
      t.trans[1] -= width;
      t.trans[2] += width/2.0;
      break;
    case M.index(lay, row, col-1):
      t.rotx = 90;
      t.rotz = 90;
      t.trans[0] += 0;
      t.trans[1] += width/-2.0;
      t.trans[2] += width/2.0;
      break;
    case M.index(lay, row, col+1):
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
  return t;
}

function mazeinit(wall) {
  //maze walls inside
  for (var i=0; i<M.walls.length; i++) {
    wall.transforms.push(setwall(M.walls[i].x, M.walls[i].y,wall.width,wall.height));
  }
  //border
  wall.transforms.push({
    sc: [M.Ncols,M.Nlayers,1],
    trans: [M.Ncols*wall.width/2.0,0,M.Nlayers*wall.width/2.0],
    rotz: 90,
    rotx: 0
  },
  {
    sc: [M.Ncols,M.Nlayers,1],
    trans: [M.Ncols*wall.width/2.0,M.Nrows*wall.width*-1,M.Nlayers*wall.width/2.0],
    rotz: 90,
    rotx: 0
  },
  {
    sc: [M.Nrows,M.Nlayers,1],
    trans: [0, M.Nrows*wall.width/-2.0,M.Nlayers*wall.width/2.0],
    rotz: 90,
    rotx: 90
  },
  {
    sc: [M.Nrows,M.Nlayers,1],
    trans: [M.Ncols*wall.width, M.Nrows*wall.width/-2.0,M.Nlayers*wall.width/2.0],
    rotz: 90,
    rotx: 90
  });

  //assemble into one massive model
  var verts = [];
  var norms = [];

  for (var i=0; i<wall.transforms.length; i++) {
    wall.rotation[0][0][0] = wall.transforms[i].rotz;
    wall.rotation[0][1][0] = wall.transforms[i].rotx;
    wall.translation[1] = wall.transforms[i].trans;
    mvLoadIdentity(wall);
    Model.objectTransforms(wall);
    for (var j=0; j<wall.verts.length; j+=3) {
      var v = wall.mvMatrix.x($M([wall.verts[j],wall.verts[j+1],wall.verts[j+2],1.0])).flatten().slice(0,3);
      var n = wall.mvMatrix.x($M([wall.norms[j],wall.norms[j+1],wall.norms[j+2],0.0])).flatten().slice(0,3);
      //console.log(v,n);
      verts.push(v[0],v[1],v[2]);
      norms.push(n[0],n[1],n[2]);
    }
  }

  wall.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 },
    a_normal: { buffer: getBuffer(norms), numComponents: 3 }
  }
  wall.numtri = verts.length / 3;

  wall.transforms = null;
  wall.verts = verts;
  wall.norms = norms;
  wall.rotation[0][0][0] = 0;
  wall.rotation[0][1][0] = 0;
  wall.translation[0] = [0,0,0];
  wall.translation[1] = [0,0,0];
  wall.center = [0,0,0];

  console.log(wall);
}