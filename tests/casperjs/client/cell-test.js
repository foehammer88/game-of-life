casper.test.begin("Test Cell draws on canvas", 2, function(test){

  casper.start('http://127.0.0.1:3000', function() {
    this.test.assertTitle('Game of Life', 'Game of Life loaded');
  });

  casper.then(function(){
    casper.waitForSelector('#gameOfCanvas', function() {
      var cellIsVisible = casper.evaluate(function(){
          var cell = new Cell(0, 0, 10, true, new createjs.Stage("gameOfCanvas"));
          return cell.canvasObject.isVisible();
      });
      casper.test.comment("cell is visible: " + cellIsVisible);
      this.test.assert(cellIsVisible , "cell drawn on canvas");
    });     
  });

  casper.run(function(){ 
    test.done() 
  });

});