// Maze object, contains functions for creating a new maze
Maze = {
    
//convert (cell id, cell id) to hashable string, these represent walls
strwall: function(x,y) {
    if (x<y) {
        return x.toString().concat(" ").concat(y.toString());
    }
    else {
        return y.toString().concat(" ").concat(x.toString());
    }
},

//class to find adjacencies of an index based of num layers, rows and cols
adj: function(nl,nr,nc) {
    
    //find the adjacencies of an index, i
    this.find = function(i) {
        var v = [];
        var row, col, lay, ii;
        lay = Math.floor(i / (nc*nr));
        ii = i-lay*nr*nc;
        
        row = Math.floor(ii / nc);
        col = ii-row*nc;

        //helper function for find()
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
},

construct: function(nl, nr, nc, width) {
    var Ncells = nr * nc * nl;
    var cells = new dset(Ncells);
    var nearbyCells = new this.adj(nl, nr, nc);
    var wallsMap = new Map();
    var walls = [];
    
    //init all walls (cell id -> cell id) to true
    for (var i=0; i<Ncells; i++) {
        var v = nearbyCells.find(i);
        for (var j=0; j<v.length; j++) {
            var w = this.strwall(i,v[j]);
            wallsMap.set(w,true);
        }
    }

    //remove walls until are cells are in the same set (so when num sets = cells.size() = 1)
    while (cells.size()>1) {
        var cell = getRandomInt(0,Ncells);
        var v = nearbyCells.find(cell);
        var adj_cell = v[getRandomInt(0,v.length)];

        if (cells.find(cell) != cells.find(adj_cell)) {
            cells.merge(cell, adj_cell);
            var w = this.strwall(cell, adj_cell);
            wallsMap.delete(w);
        }
    }

    //now parse any keys left in the wallsMap map back into (cell_id, cell_id) pairs
    wallsMap.forEach( function(val, key, map) {
        var wall = {};
        var tmp = key.split(' ');
        wall.a = parseInt(tmp[0]);
        wall.b = parseInt(tmp[1]);
        walls.push(wall);
    });

    //return all the relevcant information for the newly made maze, 
    var ret = {
        map: wallsMap,
        walls: walls,
        Nrows: nr,
        Ncols: nc,
        Nlayers: nl,
        
        //get a layer, row, column from an index
        getLRC: function(i) {
            var lay, row, col;
            lay = Math.floor(i / (nc*nr));
            ii = i-lay*nr*nc;
            row = Math.floor(ii / nc);
            col = ii-row*nc;
            return [lay,row,col];
        },
        
        //get and index from a layer, row and column
        getIndex: function(l,r,c) {
            l = Math.min(l,nl-1);
            r = Math.min(r,nr-1);
            c = Math.min(c,nc-1);
            return l*nc*nr + r*nc + c;
        }
    }
    return ret;
}

}

