// Globals
var previousWidth, canvasStage, size, cells, pressedDown = false, mouseRow = null, mouseCol = null;

Template.gameCanvas.onRendered(function () {

  setupCanvasGrid();

  setupStageEvents();

  createjs.Ticker.addEventListener("tick", handleTick);
  createjs.Ticker.paused = true;
  function handleTick(event) {
     if (!event.paused) {
         nextYear();
     }
  }

  // Make grid canvas responsive
  previousWidth = $('.container').width();
  $( window ).resize(function() {
    var currentWidth = $('.container').width();
    if (previousWidth != currentWidth) {
      setupCanvasGrid();
      previousWidth = currentWidth;
    }
  });

});

Template.gameCanvas.helpers({
    year: function () {
      return Session.get('year');
    },
    seed: function () {
      return Session.get('seed');
    },
    xSize: function () {
      return Session.get('xSize');
    },
    ySize: function () {
      return Session.get('ySize');
    }
  });

Template.gameCanvas.events({
  'click #newYear': function () {
    nextYear();
  },
  'click #run': function () {
    startTime();
  },
  'click #reset': function () {
    reset();

    seedGrid();
  },
  'click #clear': function () {
    reset();
  },
  'click #generateHash': function () {
    computeHash();
  },
  'focus #sizeX': function () {
    $("#sizeX").attr("placeholder", Session.get('xSize'));
    $("#sizeX").val("");
  },
  'focus #sizeY': function () {
    $("#sizeY").attr("placeholder", Session.get('ySize'));
    $("#sizeY").val("");
  },
  'blur #sizeX': function () {
    var xSize = $("#sizeX").val();
    if (!$.isNumeric(xSize)) {
      $("#sizeX").val(Session.get('xSize'));
    }
  },
  'blur #sizeY': function () {
    var ySize = $("#sizeY").val();
    if (!$.isNumeric(ySize)) {
      $("#sizeY").val(Session.get('ySize'));
    }
  },
  'click #resize': function () {
    resize();
  },
  'click #seedGrid': function () {
    parseSeedInput();
  }
});

// Game Setup helper methods

function setupCanvasGrid(newWidth, newHeight) {
  var width;
  var height;

  if (!$.isNumeric(newWidth) || newWidth == 0) {
    width = $('.container').width();
    width = Math.floor(width/10)*10;
    $("#sizeX").val(width/10);
  } else {
    width = newWidth*10;
  }

  if (!$.isNumeric(newHeight) || newHeight == 0) {
    height = 500;
    $("#sizeY").val(height/10);
  } else {
    height = newHeight*10;
  }

  size = 10;

  $('#gameOfCanvas').width(width);
  $('#gameOfCanvas').height(height);

  if (canvasStage == null) {
    canvasStage = new createjs.Stage("gameOfCanvas");
  } else {
    canvasStage.removeAllChildren();
  }

  canvasStage.canvas.width = width;
  canvasStage.canvas.height = height;

  Session.set('xSize', Math.floor(width/10));
  Session.set('ySize', Math.floor(height/10));

  drawGridLines();
  
  cells = new Cells(Math.floor(height / size), Math.floor(width / size), canvasStage);
  cells.initialize(size);

  seedGrid();

  function drawGridLines() {
    for (var i = 0; i < width; i+= size) {
      var line = new createjs.Shape();
      line.graphics.setStrokeStyle(0.25);
      line.graphics.beginStroke("#eee");
      line.graphics.moveTo(i, 0);
      line.graphics.lineTo(i, height);
      line.graphics.endStroke();
      canvasStage.addChild(line);
    };

    for (var i = 0; i < height; i+= size) {
      var line = new createjs.Shape();
      line.graphics.setStrokeStyle(0.25);
      line.graphics.beginStroke("#eee");
      line.graphics.moveTo(0, i);
      line.graphics.lineTo(width, i);
      line.graphics.endStroke();
      canvasStage.addChild(line);
    };

    canvasStage.update();  
  }
}

// Canvas Events

function setupStageEvents() {
    canvasStage.on("stagemousedown", function(event) {
      var row = Math.floor(event.stageY / size);
      var col = Math.floor(event.stageX / size)

      // Fix grid coordinate if event captured on edge of canvas
      if (row == cells.numRows()) {
        row--;
      }

      if (col == cells.numCols()) {
        col--;
      }

      mouseRow = row;
      mouseCol = col;

      var cell = cells.getCell(row, col);
      if (cell.alive()) {
        cell.alive(false);
      } else {
        cell.alive(true);
      }
      cell.determineFate();
      canvasStage.update();

      pressedDown = true;
    });

    canvasStage.on("stagemousemove", function(event) {
      if (pressedDown) {
        var row = Math.floor(event.stageY / size);
        var col = Math.floor(event.stageX / size)

        // Fix grid coordinate if event captured on edge of canvas
        if (row == cells.numRows()) {
          row--;
        }

        if (col == cells.numCols()) {
          col--;
        }

        if ((mouseRow != null && mouseRow != row) || (mouseCol != null && mouseCol != col)) {
          mouseRow = row;
          mouseCol = col;

          var cell = cells.getCell(row, col);
          if (cell.alive()) {
            cell.alive(false);
          } else {
            cell.alive(true);
          }
          cell.determineFate();
        }

        canvasStage.update();
      }
    });

    canvasStage.on("stagemouseup", function(event) {
      pressedDown = false;
      mouseRow = null;
      mouseCol = null;
    });
  }

// Event handler helpers - Core methods

function nextYear() {
  Session.set('year', Session.get('year') + 1);
  
  for (var i = 0; i < cells.numRows(); i++) {
    for (var j = 0; j < cells.numCols(); j++) {
      cells.fate(i, j);
    }
  }

  for (var i = 0; i < cells.numRows(); i++) {
    for (var j = 0; j < cells.numCols(); j++) {
      var cell = cells.getCell(i, j);
      cell.determineFate();
    }
  }

  canvasStage.update();
}

function startTime() {
  if (createjs.Ticker.paused) {  
    createjs.Ticker.paused = false;
    $("#run").html('Pause');
  } else {
    createjs.Ticker.paused = true;
    $("#run").html('Run');
  }
}

function reset() {
  Session.set('year', 0);

  for (var i = 0; i < cells.numRows(); i++) {
    for (var j = 0; j < cells.numCols(); j++) {
      var cell = cells.die(i, j);
      cell.determineFate();
    }
  }

  canvasStage.update();
}

function seedGrid(seedArray) {

  if (seedArray == null) {
    if (canvasStage.canvas.width == 1140) {
      // Seed with three Glider Guns that aim gliders towards the center of the grid
      seedArray = [0,0,512,1099511627776,2560,1374389534720,3158016,111464297741156350,4468736,111464299217551360,12893433856,210520702976,12894013952,1388415483904,8520192,1103873703936,4456448,2281701376,3145728,805306368,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,805306368,0,2281701376,0,1103873703936,0,1388415483904,0,210520702976,0,3377908160659456,0,3377906684264448,0,1374389534720,0,1099511627776,0,0];
    } else if (canvasStage.canvas.width == 940) {
      // Seed with three Glider Guns that aim gliders towards the center of the grid
      seedArray = [0,0,4096,8589934592,20480,10737418240,25264134,26389895970816,35749894,26389907505152,103147470848,1644692992,103152111616,10846995968,68161536,8624013312,35651584,17825792,25165824,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6291456,0,17825792,0,8624013312,0,10846995968,0,1644692992,0,26389907505152,0,26389895970816,0,10737418240,0,8589934592,0,0];
    } else if (canvasStage.canvas.width == 720){
      // Seed with one Glider Gun that aims towards the bottom right of the grid
      seedArray = [0,0,1024,0,5120,0,6316033,34359738368,8937473,34359738368,25786867712,0,25788027904,0,17040384,0,8912896,0,6291456,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    } else {
      // Default seed, is an acorn that can support arbitrary grid size
      seedArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16384,0,4096,0,52736,0,0,0,0,0,0,0,0,0,0,0,0,0];
      for (var i = seedArray.length; i < cells.numRows()*2; i++) {
        seedArray.push(0);
        seedArray.push(0);
      };
    }
  }

  var seedArrayCombined = [];
  var zeroesArray = [];
  var halfCols = Math.floor(cells.numCols()/2);
  var offset = (cells.numCols() % 2);

  for (var i = 0; i < seedArray.length; i+=2) {
    var seedRow = seedArray[i];
    seedRow = seedRow.toString(2);
    if (seedRow.length < halfCols) {
      // To preserve the grid layout, need to prepend if the number doesnt have the correct
      // number of leading zero bits
      var difference = halfCols - seedRow.length;
      for (var c = 0; c < difference; c++) {
        seedRow = "0" + seedRow;
      }
    }
    var seedRowSecondHalf = seedArray[i+1];
    seedRowSecondHalf = seedRowSecondHalf.toString(2);
    if (seedRowSecondHalf.length < halfCols + offset) {
      // To preserve the grid layout, need to prepend if the number doesnt have the correct
      // number of leading zero bits
      var difference = halfCols + offset - seedRowSecondHalf.length;
      for (var c = 0; c < difference; c++) {
        seedRowSecondHalf = "0" + seedRowSecondHalf;
      }
    }
    seedArrayCombined.push(seedRow + seedRowSecondHalf);
    // Keep track of the empty rows, so that iteration can save steps
    if (parseInt(seedRow, 2) == 0 && parseInt(seedRowSecondHalf, 2) == 0){
      zeroesArray.push(true);
    } else {
      zeroesArray.push(false);
    }
  }

  // Correct the length of the seed if the seed is for a grid smaller than 
  // the actual grid (number of rows)
  if (seedArrayCombined.length < cells.numRows()) {
    var difference = cells.numRows() - seedArrayCombined.length;
    for (var i = 0; i < difference; i++) {
      zeroesArray.push(true);
    };
  }

  // Populate the grid with 'live' cells
  for (var i = 0; i < cells.numRows(); i++) {
    if (!zeroesArray[i]) {
      var seedRow = seedArrayCombined[i];
      for (var j = 0; j < cells.numCols(); j++) {
        if(seedRow.charAt(j) === "1") {
          cells.live(i, j).determineFate();
        }
      }
    }
  }
  canvasStage.update();
}

function computeHash() {
  var hashArray = [];
  // Compute the binary representation of the current state of the grid
  // '1' is a live cell, '0' is a dead cell
  for (var i = 0; i < cells.numRows(); i++) {
    var binaryNumberString = "";
    for (var j = 0; j < cells.numCols(); j++) {
      if (cells.getCell(i, j).alive()) {
        binaryNumberString = binaryNumberString.concat("1");
      } else {
        binaryNumberString = binaryNumberString.concat("0");
      }
      if (j == (Math.floor(cells.numCols()/2) - 1)) {
        hashArray.push(parseInt(binaryNumberString, 2));
        binaryNumberString = "";
      }
    }
    hashArray.push(parseInt(binaryNumberString, 2));
  }
  Session.set('seed', hashArray);
}

function parseSeedInput() {
  var input = $("#seedInput").val();
  var arrayInput = input.split(',');
  var validInput = true;
  for (var i = 0; i < arrayInput.length; i++) {
    if (validInput){
      validInput = $.isNumeric(arrayInput[i]);
    }
  };

  if (validInput) {
    var seedArrayString = "[" + input + "]";
    reset();
    seedGrid(JSON.parse(seedArrayString));
  }
}

function resize() {
  var newX = $('#sizeX').val();
  var newY = $('#sizeY').val();

  setupCanvasGrid(newX, newY);
}
