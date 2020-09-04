//********************* */
//  SCRIPT PART 
//********************* */

var board = null
var game = new Chess()
var $board = $('#board')
var $status = $('#status')
var $evaluation = document.getElementById('evaluationBar')
var $serverStatus = $('#serverStatus')
var connected = false
var analysisEnabled = false
var analysisPending = false

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
start()
updateStatus()

//bind keybord events
document.onkeydown = function(evt) {
    if(evt.keyCode == 37){back();};
    if(evt.keyCode == 39){forward();};
};

  testLink();
  setInterval(function(){testLink();}, 10000);



//********************* */
//  METHODS PART 
//********************* */

//Actions on mouse or keyboard events

function onDragStart (source, piece, position, orientation) {
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
  updateStatus()
}

function enableAnalysis(checkboxElem) {
  if (checkboxElem.checked) {
    analysisEnabled = true;
    changePosition(null, null, game.fen())
  } else {
    analysisEnabled = false;
  }
}

function changePosition(previousFen, move, fen){
  //cleaning infos
  clearEval()
  eraseDrawings()
  
  if(analysisEnabled & connected){
    analysisPending = true;
    setServerStatus('orange', 'Waiting for<br>Analysis');
    getAnalysis(previousFen, move, fen).then(analysis => {displayAnalysis(analysis); analysisPending = false; setServerStatus('green', 'Server<br>Ready')});
  }
  
}

function back(){
  game.undo();
  onSnapEnd()
  changePosition(null, null, game.fen());
}

function forward(){
  console.log('forward')
}

//printing some informations about the game to the player
function updateStatus () {
  var status = ''

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

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  //$status.html('<label><h1>Status: ' + status + '</h1></label>')

}

//start position button and function
$('#startBtn').on('click', start)
function start () {
    board.start()
    game = new Chess()
    changePosition(null, null, game.fen())
}

//clear board button and function
$('#clearBtn').on('click', clear)
function clear () {
  eraseDrawings()
    board.clear()
    game = new Chess()
}

//button and function to show only the pawn structure on the board
$('#onlyPawnsBtn').on('click', showPawnStructure)
function showPawnStructure () {
  eraseDrawings()
  getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces));
}

//server analysis treatment
function displayAnalysis(analysis){
  console.log(analysis)
  $evaluation.value = 500 - analysis.evaluation;
  analysis.moveEvaluations.forEach(element => {
    if (game.turn() === 'b') {
      paintMoveAbsolute(element.move, element.evaluation*(-1));
    }else{
      paintMoveAbsolute(element.move, element.evaluation);
    }
  });
}

function clearEval(){
  //TODO: disable bar
  $evaluation.value = "500";
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

function setServerStatus(colour, text){
    $serverStatus.css("background-color", colour)
    $serverStatus.html(text)
}