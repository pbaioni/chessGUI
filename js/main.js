//********************* */
//  SCRIPT PART 
//********************* */
//initialize libraries
var board = null
var game = new Chess()

//DOM objects
var $board = $('#board')
var $status = $('#status')
var $evaluationBar = document.getElementById('evaluationBar')
var $evaluation = $('#evaluation')
var $serverStatus = $('#serverStatus')
var $comment = $('textarea#comment')
var $onlyPawnsBtn = $('#onlyPawnsBtn')
var $pgn = $('#pgnLabel')

//script variables
var connected = false
var analysisEnabled = true
var analysisPending = false
var onlyPawns = false
var influenceEnabled = false

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

//bind keybord events
document.onkeydown = function(evt) {
    if(evt.keyCode == 37){back();};
    if(evt.keyCode == 39){forward();};
};

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
  $pgn.html('PGN: ' + game.pgn())
  checkGameTerminantion()
}

function checkGameTerminantion () {
 
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

function back(){
  if(!analysisPending){
    game.undo();
    onSnapEnd()
    changePosition(null, null, game.fen());
  }
}

function forward(){
  console.log('forward')
}

//********************* */
//  BUTTONS and CHECKBOXES 
//********************* */

//BUTTONS

//start position button and function
$('#startBtn').on('click', start)
async function start () {
    board.start()
    game = new Chess()
    $pgn.html('PGN:')
    $comment.val('')
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
    $onlyPawnsBtn.html('Pawn Structure')
    onlyPawns = false
  }else{
    eraseDrawings()
    getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces));
    $onlyPawnsBtn.html('Show all pieces')
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
        $('#updateBtn').css("background-color", 'orange')
        $('#updateBtn').html('Stop Update')
        $('#importBtn').attr('disabled', true)
        $('#importBtn').css("background-color", 'grey')
        $('#analysisCheckbox').attr('disabled', true)
        $('#influenceCheckbox').attr('disabled', true)
        setServerStatus('orange', 'Updating<br>Line');

      updateDepth(game.fen(), depth).then(analysis => {
        analysisPending = false; 
        serverReady()
      });
    }
  }else{
    //stopping task
    stopTask()

    //setting analysis variables
    analysisEnabled  = $('#analysisCheckbox').is(":checked");

    //managing GUI
    $('#updateBtn').css("background-color", '#2ba6cb')
    $('#updateBtn').html('Update Line Depth')
    $('#importBtn').attr('disabled', false)
    $('#importBtn').css("background-color", '#2ba6cb')
    $('#analysisCheckbox').attr('disabled', false)
    $('#influenceCheckbox').attr('disabled', false)

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
        $('#importBtn').css("background-color", 'orange')
        $('#importBtn').html('Stop Import')
        $('#updateBtn').attr('disabled', true)
        $('#updateBtn').css("background-color", 'grey')
        $('#analysisCheckbox').attr('disabled', true)
        $('#influenceCheckbox').attr('disabled', true)
        setServerStatus('orange', 'Importing<br>Games');

        //launch task
        importPgn(openingDepth, analysisDepth).then(response => {serverReady(); analysisPending = false;});
      }
    }
  }else{
    //stopping task
    stopTask()

    //setting analysis variables
    analysisEnabled  = $('#analysisCheckbox').is(":checked");

    //managing GUI
    $('#importBtn').css("background-color", '#2ba6cb')
    $('#importBtn').html('Import Games')
    $('#updateBtn').attr('disabled', false)
    $('#updateBtn').css("background-color", '#2ba6cb')
    $('#analysisCheckbox').attr('disabled', false)
    $('#influenceCheckbox').attr('disabled', false)

    //recall analysis for current position
    changePosition(null, null, game.fen())
  }
}


//delete line button and function
$('#commentBtn').on('click', setComment)
async function setComment() {
    setPositionComment(game.fen(), $comment.val()).then(response => {
      $('#commentBtn').css("background-color", 'green');
      $('#commentBtn').html('Comment saved');
    });
    await sleep(1000)
    $('#commentBtn').css("background-color", '#2ba6cb');
    $('#commentBtn').html('Save Comment');
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
  $comment.val('')
  
  if(analysisEnabled & connected){
    analysisPending = true;
    setServerStatus('orange', 'Waiting for<br>Analysis');
    getAnalysis(previousFen, move, fen).then(analysis => {
      displayAnalysis(analysis); 
      analysisPending = false; 
      setServerStatus('green', 'Server<br>Ready')
    });
  }

}

//server analysis treatment
function displayAnalysis(analysis){
    console.log(analysis)
    $evaluationBar.value = 500 - analysis.evaluation;
    $evaluation.html('<div class="eval"><b>' + analysis.evaluation/100 + '</b></div><div class="depth">('+ analysis.depth + ')</div>');
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
    $comment.val(analysis.comment);
}

function clearEval(){
  $evaluationBar.value = "500";
  $evaluation.html('<h1>-</h1>');
}

//********************* */
//  SERVER RELATED METHODS 
//********************* */


function setServerStatus(colour, text){
  $serverStatus.css("background-color", colour)
  $serverStatus.html(text)
}

function setConnected(value){
  connected = value;
  if(!analysisPending){
    if(connected){
      setServerStatus('green', 'Server<br>Ready')
    }else{
      setServerStatus('red', 'Server<br>Disconnected')
    }
  }
}

function serverReady(){
  setServerStatus('green', 'Server<br>Ready')
}

//********************* */
//  OTHER METHODS 
//********************* */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
