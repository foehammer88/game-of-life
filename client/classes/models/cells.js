Cells = function Cells (numRows, numCols, canvasStage) {
  this.data = [];
  this.rows = numRows;
  this.cols = numCols;
  this.canvasStage = canvasStage;
}

Cells.prototype.initialize = function(cellSize) {
  for (var i = 0; i < this.rows; i++) {
    this.data[i] = [];
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = [];
      this.data[i][j].push(new Cell(j, i, cellSize, false, this.canvasStage));
    };
  };
}

Cells.prototype.numRows = function() {
  return this.rows;
}

Cells.prototype.numCols = function() {
  return this.cols;
}

Cells.prototype.getCell = function(row, col) {
  return this.data[row][col][0];
}

Cells.prototype.live = function(row, col) {
  var cell = this.getCell(row, col);
  cell.alive(true);
  return cell;
}

Cells.prototype.die = function(row, col) {
  var cell = this.getCell(row, col);
  cell.alive(false);
  return cell;
}

Cells.prototype.fate = function(row, col) {
  var numberOfAliveNeighbors = 0;

  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      if ((((i + row) >= 0) && ((i + row) < (this.rows))) && 
        (((j + col) >= 0) && ((j + col) < (this.cols))) &&
        !((i == 0) && (j == 0))) {
        var neighbor = this.getCell(row + i, col + j);
        if (neighbor.previouslyAlive()) {
          numberOfAliveNeighbors++;
        }
      }
    };
  };

  var currentCell = this.getCell(row, col);
  if (!currentCell.alive() && numberOfAliveNeighbors == 3) {
    this.live(row, col);
  } else if (currentCell.alive() && (numberOfAliveNeighbors < 2 || numberOfAliveNeighbors > 3)) {
    this.die(row, col);
  }

}