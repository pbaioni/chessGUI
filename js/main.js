//*************** */
//  SCRIPT PART 
//*************** */
//initialize javascript libraries
var board = null
var game = new Chess()

//script variables
var connected = false
var analysisEnabled = true
var influenceEnabled = false
var analysisPending = false
var onlyPawns = false

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
  onSnapEnd: onSnapEnd
}

//create chessboard
board = Chessboard('board', config)
var $board = $('#board')

//bind keybord events
document.onkeydown = function(evt) {
    if(evt.keyCode == 37){back();};
    if(evt.keyCode == 39){forward();};
};

  //start periodic check of server connection
  testLink().then(response => start());
  setInterval(function(){testLink();}, 10000);


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
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
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
    testColors()
    await sleep(2000)
    changePosition(null, null, game.fen())
}

//flip board button and function
$('#flipBtn').on('click', flip)
function flip () {
  eraseDrawings()
  board.flip()
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
    eraseDrawings()
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
    eraseArrows()
    eraseContours()
    analysisEnabled = false;
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
  clearEval()
  eraseDrawings()
  displayComment('')
  
  if(analysisEnabled & connected){
    analysisPending = true;
    serverWaiting()
    getAnalysis(previousFen, move, fen).then(analysis => {
      displayAnalysis(analysis); 
      analysisPending = false; 
      serverReady()
    });
  }

}

//server analysis treatment
function displayAnalysis(analysis){
    //console.log(analysis)
    setEval(analysis.evaluation, analysis.depth)
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
    displayComment(analysis.comment);
}


//********************* */
//  OTHER METHODS 
//********************* */

function setConnected(value){
  connected = value;
  if(!analysisPending){
    if(connected){
      serverReady()
    }else{
      serverDisconnected()
    }
  }
}

function setAnalysisEnabled(value){
  analysisEnabled = value;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
