
//Actions on mouse events

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
  getAnalysis(previousFen, move, fen).then(analysis => displayAnalysis(analysis));

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
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

  $status.html('Status: ' + status)
}


//start position button and function
$('#startBtn').on('click', start)
function start () {
    board.start()
    game = new Chess()
    eraseDrawings()
    getAnalysis(null, null, game.fen()).then(analysis => displayAnalysis(analysis))
}

//clear board button and function
$('#clearBtn').on('click', clear)
function clear () {
    board.clear()
    game = new Chess()
}

//button and function to show only the pawn structure on the board
$('#onlyPawnsBtn').on('click', showPawnStructure)
function showPawnStructure () {
  getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces));
}

//server analysis treatment
function displayAnalysis(analysis){
  console.log(analysis)
  $evaluation.html('Evaluation: ' + analysis.evaluation/100)
  $bestmove.html('Best move: ' + analysis.bestMove)
  analysis.moveEvaluations.forEach(element => {
    paintMove(element.move, element.centipawnLoss);
  });
}

function clearEval(){
  $evaluation.html('Waiting for server analysis...')
  $bestmove.html('')
}

//********************* */
//  SCRIPT PART 
//********************* */

var board = null
var $board = $('#board')
var game = new Chess()
var $status = $('#status')
var $evaluation = $('#evaluation')
var $bestmove = $('#bestmove')
var $pgn = $('#pgn')

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
updateStatus()