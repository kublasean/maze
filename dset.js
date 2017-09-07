function node() {
  this.rank = 0;
  this.parent = -1;
}

function dset(N) {
  this.S = [];
  for (var i=0; i<N; i++)
    this.S.push(new node());
  this.Nsets = N;

this.size = function() {
  return this.Nsets;
}

this.newset = function() {
  this.S.push(new node());
  this.Nsets += 1;
  return S.length-1;
}

this.merge = function(i,j) {
  i = this.find(i);
  j = this.find(j);

  if (i != j) {
    var Si = this.S[i];
    var Sj = this.S[j];

    if (Si.rank > Sj.rank)
      Sj.parent = i;
    else if (Si.rank < Sj.rank)
      Si.parent = j;
    else {
      Sj.parent = i;
      Si.rank += 1;
    }
    this.Nsets -= 1;
  }
  return this.find(i);
}

this.find = function(i) {
  //console.log(i,this.S.length, this.Nsets);
  if (this.S[i].parent == -1)
    return i;

  this.S[i].parent = this.find(this.S[i].parent);
  return this.S[i].parent;
}
}
