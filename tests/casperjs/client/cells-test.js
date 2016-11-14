casper.test.begin("Test Cells fate", 5, function(test){

  casper.start('http://127.0.0.1:3000', function() {
    this.test.assertTitle('Game of Life', 'Game of Life loaded');
  });

  casper.then(function(){
    casper.waitForSelector('#gameOfCanvas', function() {
      var cellIsAlive = casper.evaluate(function(){
          
          var cells = new Cells(3, 3, new createjs.Stage("gameOfCanvas"));
          cells.initialize(10);
          
          cells.live(0,0).determineFate();
          cells.live(0,1).determineFate();
          cells.live(0,2).determineFate();

          cells.fate(1,1);

          return cells.getCell(1,1).alive();
      });
      casper.test.comment("cell is alive: " + cellIsAlive);

      this.test.assert(cellIsAlive , "cell becomes alive with three neighbors");
    });     
  });

  casper.then(function(){
    casper.waitForSelector('#gameOfCanvas', function() {
      var cellIsAlive = casper.evaluate(function(){
          
          var cells = new Cells(3, 3, new createjs.Stage("gameOfCanvas"));
          cells.initialize(10);
          
          cells.live(0,0).determineFate();
          cells.live(0,1).determineFate();
          cells.live(0,2).determineFate();

          cells.fate(0,1);

          return cells.getCell(0,1).alive();
      });
      casper.test.comment("cell is alive: " + cellIsAlive);

      this.test.assert(cellIsAlive , "cell is still alive with two neighbors");
    });     
  });

  casper.then(function(){
    casper.waitForSelector('#gameOfCanvas', function() {
      var cellIsAlive = casper.evaluate(function(){
          
          var cells = new Cells(3, 3, new createjs.Stage("gameOfCanvas"));
          cells.initialize(10);
          
          cells.live(0,0).determineFate();
          cells.live(0,1).determineFate();
          cells.live(0,2).determineFate();

          cells.fate(0,2);

          return cells.getCell(0,2).alive();
      });
      casper.test.comment("cell is dead: " + cellIsAlive);

      this.test.assertNot(cellIsAlive , "cell becomes dead with only one neighbor");
    });     
  });

  casper.then(function(){
    casper.waitForSelector('#gameOfCanvas', function() {
      var cellIsAlive = casper.evaluate(function(){
          
          var cells = new Cells(3, 3, new createjs.Stage("gameOfCanvas"));
          cells.initialize(10);
          
          cells.live(0,0).determineFate();
          cells.live(0,1).determineFate();
          cells.live(0,2).determineFate();
          cells.live(1,0).determineFate();
          cells.live(1,1).determineFate();

          cells.fate(1,1);

          return cells.getCell(1,1).alive();
      });
      casper.test.comment("cell is dead: " + cellIsAlive);

      this.test.assertNot(cellIsAlive , "cell becomes dead with four neighbors");
    });     
  });

  casper.run(function(){ 
    test.done() 
  });
  
});