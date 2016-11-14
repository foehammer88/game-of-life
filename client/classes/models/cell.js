Cell = function Cell (x, y, size, alive, canvasStage) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.isAlive = alive;
  this.previousAliveState = alive;
  this.readyToDetermineFate = false;
  this.canvasStage = canvasStage;
  this.canvasObject = null;

  if (alive) {
    var cellRect = new createjs.Shape();
    cellRect.graphics.beginFill("#eee").drawRect(x * size, y * size, size, size);
    this.canvasObject = cellRect;
    canvasStage.addChild(cellRect);
    canvasStage.update();
  }
}

Cell.prototype.x = function() {
  return this.x;
}

Cell.prototype.y = function() {
  return this.y;
}

Cell.prototype.determineFate = function() {
    this.redraw();
    this.previousAliveState = this.isAlive;
}

Cell.prototype.alive = function(alive) {
  if (alive != null) {
    this.isAlive = alive;
  } else {
    return this.isAlive;
  }
}

Cell.prototype.previouslyAlive = function() {
  return this.previousAliveState;
}

Cell.prototype.redraw = function() {
  if (this.isAlive && this.canvasObject == null) {
    var cellRect = new createjs.Shape();
    cellRect.graphics.beginFill("#eee").drawRect(this.x * this.size, this.y * this.size, this.size, this.size);
    this.canvasObject = cellRect;
    this.canvasStage.addChild(cellRect);
  } else if (!this.isAlive && this.canvasObject != null) {
    this.canvasStage.removeChild(this.canvasObject);
    this.canvasObject = null;
  }

  this.readyToDetermineFate = false;
}