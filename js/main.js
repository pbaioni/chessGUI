
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
  var move = source + target;
  var fen = game.fen();
  //cleaning infos
  clearEval()
  eraseArrows()
  //asking server
  if(analysis){setAnalysisPending(); getAnalysis(previousFen, move, fen).then(analysis => displayAnalysis(analysis));};

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function back(){
  eraseDrawings()
  game.undo();
  board.position(game.fen());
  if(analysis){getAnalysis(null, null, game.fen()).then(analysis => displayAnalysis(analysis));};
}

function forward(){
  console.log('forward')
}

function enableAnalysis(checkboxElem) {
  if (checkboxElem.checked) {
    analysis = true;
    clearEval()
    setAnalysisPending();
    getAnalysis(null, null, game.fen()).then(analysis => displayAnalysis(analysis))
  } else {
    analysis = false;
  }
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
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html('<label><h1>Status: ' + status + '</h1></label>')

}

//start position button and function
$('#startBtn').on('click', start)
function start () {
    board.start()
    game = new Chess()
    eraseDrawings()
    if(analysis){getAnalysis(null, null, game.fen()).then(analysis => displayAnalysis(analysis));};
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
  analysisPending = false;
  linkOk(true);
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
  $evaluation.value = "500";
}

function setAnalysisPending(){
  analysisPending = true;
  $serverStatus.css("background-color", "orange")
  $serverStatus.html('Waiting for<br>Analysis')
}

function linkOk(status){
  if(status & !analysisPending){
    $serverStatus.css("background-color", "green")
    $serverStatus.html('Server<br>Connected')
  }

  if(!status) {
    $serverStatus.css("background-color", "red")
    $serverStatus.html('Server<br>Disonnected')
  }
}

//********************* */
//  SCRIPT PART 
//********************* */

var board = null
var game = new Chess()
var analysis = false
var $board = $('#board')
var $status = $('#status')
var $evaluation = document.getElementById('evaluationBar')
var $serverStatus = $('#serverStatus')
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

testLink()
setInterval(function(){testLink();}, 10000);