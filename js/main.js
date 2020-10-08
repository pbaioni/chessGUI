//*************** */
//  SCRIPT PART 
//*************** */
//initialize javascript libraries
var board = null
var game = new Chess()

//script variables
var connected = false
var firstConnection = true
var analysisEnabled = true
var influenceEnabled = false
var drawingsEnabled = true
var analysisPending = false
var onlyPawns = false
var boardFlipped = false
var mouseSquare
var drawingColor = null
var isDrawing = false
var drawStart
var tempArrowWidth = 8

//chessboard configuration
var config = {
  orientation: 'white',
  draggable: true,
  position: 'start',
  appearSpeed: 'fast',
  moveSpeed: 'fast',
  snapbackSpeed: 50,
  snapSpeed: 50,
  trashSpeed: 'fast',
  sparePieces: false,
  pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
  showNotation: false,
  showerrors: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

//create chessboard
board = Chessboard('board', config)
var $board = $('#board')

//BIND KEYBOARD EVENTS
document.onkeydown = function(evt) {
    if(evt.key == 'ArrowLeft'){back()};
    if(evt.key == 'ArrowRight'){forward()};
    if(evt.ctrlKey & evt.key == 'Enter'){setComment()};
    if(evt.key == 'r'){drawingColor = '#ff0000'}
    if(evt.key == 'g'){drawingColor = '#00ff00'}
    if(evt.key == 'b'){drawingColor = '#0000ff'}
    if(evt.key == 'y'){drawingColor = '#ffff00'}
    if(evt.key == 'c'){drawingColor = '#00ffff'}
    if(evt.key == 'w'){drawingColor = '#ffffff'}
    if(evt.key == 'p'){drawingColor = '#9900dd'}
    if(evt.key == 'k'){drawingColor = '#000000'}
};

document.onkeyup = function(evt) {
  drawingColor = null
};

//DRAWING LISTENERS

//inhibiting context menu display on right click
window.addEventListener('contextmenu', function(ev) {
  ev.preventDefault();
}, false);

//start drawing
$board.mousedown(function(ev) {
  if(ev.which == 3 && drawingsEnabled){
    isDrawing = true
    drawStart = mouseSquare

    //draw temp circle
    if(drawingColor){
      drawCircle(mouseSquare, drawingColor, 'temp')
    }   
}
});

$board.mouseup(function(ev) {
  if(ev.which== 3 && drawingsEnabled){

    //erasing temp drawings
    eraseTempContext()

    if(drawStart === mouseSquare){  //circle case
      //draw circle
      if(isDrawing){
        storeDrawing(game.fen(), 'circle', drawStart, drawingColor).then(promise => changePosition(null, null, game.fen()))
      } 
    }else{  //arrow case
      //draw arrow
      if(isDrawing){
        storeDrawing(game.fen(), 'arrow', drawStart + mouseSquare, drawingColor).then(promise => changePosition(null, null, game.fen()))
      } 
    }

    //reinit drawing variables
    drawStart = null
    isDrawing = false
  }
});

//stopping server on HMI exit
window.onbeforeunload = function() {
  shutdownServer()
}

  //test arrow colors and start periodic check of server connection
  testColors().then(promise => {start(); testLink(); setInterval(function(){testLink()}, properties.testlinkPeriod)})
    

//********************* */
//  CALLBACK METHODS 
//********************* */

//Actions on mouse or keyboard events

function onDragStart (source, piece, position, orientation) {

  //freezing the board moves during analysis
  if(analysisPending) return false

  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  var previousFen = game.fen();
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  //asking for position evaluation (server analysis)
  changePosition(previousFen, source+target, game.fen())

}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
  setPgnLabel('PGN: ' + game.pgn())
  checkGameTermination()
}

function onMouseoverSquare(square){
  mouseSquare = square

  //drawing temp arrow if needed
  if(isDrawing && drawingColor){
    if(mouseSquare != drawStart){
      eraseTempContext()
      drawArrow(drawStart, mouseSquare, drawingColor, properties.userArrowWidth, 'temp')
    }
  }
}

function onMouseMove(event) {
  finalPoint = getMousePos(drawCanvas, event);

  if (!mouseDown) return;
  if (initialPoint.x == finalPoint.x && initialPoint.y == finalPoint.y) return;

  drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawArrowToCanvas(drawContext);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Q(evt.clientX - rect.left),
    y: Q(evt.clientY - rect.top)
  };
}

function checkGameTermination () {
 
  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    alert('Game over, ' + moveColor + ' is in checkmate.')
  }

  // draw?
  else if (game.in_draw()) {
    alert('Game over, drawn position')
  }

  // stalemate?
  else if (game.in_stalemate()) {
    alert('Game over, draw by stalemate')
  }
}

// keyboard actions

//on left arrow
function back(){
  if(!analysisPending){
    game.undo();
    onSnapEnd()
    changePosition(null, null, game.fen());
  }
}

//on right arrow
function forward(){
  console.log('forward')
}

//************************** */
//  BUTTONS and CHECKBOXES 
//************************** */

//BUTTONS

//start position button and function
$('#startBtn').on('click', start)
async function start () {
    board.start()
    game = new Chess()
    setPgnLabel('PGN:')
    displayComment('')
    changePosition(null, null, game.fen())
}

//flip board button and function
$('#flipBtn').on('click', flip)
function flip () {
  eraseDrawings()
  board.flip()
  boardFlipped = boardFlipped ? false : true;
  changePosition(null, null, game.fen())
}

//button and function to show only the pawn structure on the board
$('#onlyPawnsBtn').on('click', showPawnStructure)
function showPawnStructure () {
  if(onlyPawns){
    board.position(game.fen())
    changePosition(null, null, game.fen())
    toggleOnlyPawnsBtn(onlyPawns)
    onlyPawns = false
  }else{
    eraseArrows()
    eraseContours()
    getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces));
    toggleOnlyPawnsBtn(onlyPawns)
    onlyPawns = true
  }
}

//delete line button and function
$('#deleteBtn').on('click', deleteFromHere)
function deleteFromHere() {
  var line = window.prompt("Enter line to delete in uci format (ex: g1f3): ");
  if(line){
    deleteLine(game.fen(), line).then(response => changePosition(null, null, game.fen()));
  }
}

$('#updateBtn').on('click', update)
function update() {
  if(!analysisPending){
  var depth = window.prompt("Enter new depth (ex: 28): ");
    if(depth){
      //running task requiring chess engine
      analysisPending = true

      //avoiding conflicts
      analysisEnabled  = false;

      //managing GUI
      disableAnalysisButtons()
      toggleUpdateButton(true)
      serverUpdating()

      updateDepth(game.fen(), depth).then(analysis => {
        analysisPending = false; 
        enableAnalysisButtons();
        toggleUpdateButton(false);
        serverReady();
      });
    }
  }else{
    //stopping task
    stopTask()

    //setting analysis variables
    analysisPending = false;

    //managing GUI
    enableAnalysisButtons()
    toggleUpdateButton(false)
    serverReady()

    //recall analysis for current position
    changePosition(null, null, game.fen())
  }
}

//import openings from games
$('#importBtn').on('click', importGames)
function importGames() {
  if(!analysisPending){
    var openingDepth = window.prompt("Enter the opening depth to import (ex: 4): ");
    if(openingDepth != null){
      var analysisDepth = window.prompt("Enter the analysis depth for the import (ex: 24): ");
      if(analysisDepth != null){

        //running task requiring chess engine
        analysisPending = true

        //avoiding conflicts
        analysisEnabled  = false;

        //managing GUI
    
        disableAnalysisButtons()
        toggleImportButton(true)
        serverImporting()

        //launch task
        importPgn(openingDepth, analysisDepth).then(response => {serverReady(); analysisPending = false;
          enableAnalysisButtons()
          toggleImportButton(false)
          serverReady()});
      }
    }
  }else{
    //stopping task
    stopTask()

    //setting analysis variables
    analysisPending = false;

    //managing GUI
    enableAnalysisButtons()
    toggleImportButton(false)
    serverReady()

    //recall analysis for current position
    changePosition(null, null, game.fen())
  }
}


//comment button and function
$('#commentBtn').on('click', setComment)
async function setComment() {
    setPositionComment(game.fen(), $comment.val()).then(response => {
      toggleCommentButton()
    });
}

//CHECKBOXES

function enableAnalysis(checkboxElem) {
  if (checkboxElem.checked) {
    analysisEnabled = true;
    changePosition(null, null, game.fen())
  } else {
    analysisEnabled = false;
    influenceEnabled = false;
    checkInfluence(false)
  }
}

function enableDrawings(checkboxElem) {
  if (checkboxElem.checked) {
    drawingsEnabled = true;
    changePosition(null, null, game.fen())
  } else {
    eraseDrawings()
    drawingsEnabled = false;
  }
}

function enableInfluence(checkboxElem) {
  if (checkboxElem.checked) {
    influenceEnabled = true;
    changePosition(null, null, game.fen())
  } else {
    eraseContours()
    influenceEnabled = false;
  }
}

//********************* */
//  ANALYSIS METHODS 
//********************* */

function changePosition(previousFen, move, fen){
  //cleaning infos
  clearEval(boardFlipped)
  eraseCanvases()
  displayComment('')
  
  if(connected){
    analysisPending = true;
    serverWaiting()
    getAnalysis(previousFen, move, fen, analysisEnabled).then(analysis => {
      if(analysis){
        displayAnalysis(analysis)
        analysisPending = false; 
        serverReady();
      }
    });
  }

}

//server analysis treatment
function displayAnalysis(analysis){
    console.log(analysis)
    setEval(analysis.bestMove, analysis.evaluation, analysis.depth, boardFlipped)

    analysis.moves.forEach(element => {
      if (game.turn() === 'b') {
        paintMoveAbsolute(element.move, element.evaluation*(-1));
      }else{
        paintMoveAbsolute(element.move, element.evaluation);
      }
    });

    if(influenceEnabled){
      analysis.influences.forEach(element => {
          paintInfluence(element.square, element.influence);
      });
    }

    if(drawingsEnabled){
      analysis.drawings.forEach(element => {
        if(element.type === 'circle'){
          drawCircle(element.path, element.color, 'drawing');
        }
        if(element.type === 'arrow'){
          drawArrow(element.path.substring(0, 2), element.path.substring(2, 4), element.color, properties.userArrowWidth, 'drawing');
        }
      });
    }
    displayComment(analysis.comment);
}

//server analysis treatment
async function analysisRollback(){
  analysisPending = false; 
  serverError().then(promise => serverReady())
}

//********************* */
//  OTHER METHODS 
//********************* */

function setConnected(value){
  connected = value;
  if(!analysisPending){
    if(connected){
      serverReady()
      if(firstConnection){
        changePosition(null, null, game.fen(), boardFlipped)
        firstConnection = false
      }
    }else{
      serverDisconnected()
    }
  }
}

function setAnalysisEnabled(value){
  analysisEnabled = value;
}

function saveSettings(){
  hideSettings()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
