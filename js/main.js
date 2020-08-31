// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var $board = $('#board')
var game = new Chess()
var $status = $('#status')
var $evaluation = $('#evaluation')
var $bestmove = $('#bestmove')
var $pgn = $('#pgn')

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

  //asking for position evaluation (analysis)
  var move = source + target;
  var fen = game.fen();
  clearEval()
  getanalysis(previousFen, move, fen).then(analysis => displayAnalysis(analysis));

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

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

  //testMethods()
}

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
board = Chessboard('board', config)

updateStatus()

function start () {
    board.start()
    game = new Chess()
    getanalysis(null, null, game.fen()).then(analysis => displayAnalysis(analysis))
}

function clear () {
    board.clear()
    game = new Chess()
}

function showPawnStructure () {
  getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces));
}

function displayAnalysis(analysis){
  console.log(analysis)
  $evaluation.html('Evaluation: ' + analysis.evaluation/100)
  $bestmove.html('Best move: ' + analysis.bestMove)
}

function clearEval(){
  $evaluation.html('Waiting for server analysis...')
  $bestmove.html('')
}

function testMethods(){
  //test circles
  drawCircle('h6', createColor('yellow', 4, 0.8), 5);
  drawCircle('f8', createColor('blue', 3, 0.6), 5);
  //test arrows
  drawArrow('g1', 'f3', createColor('green', 5, 0.4), 16);
  drawArrow('e2', 'e4', createColor('green', 5, 0.4), 20);
  drawArrow('a2', 'a3', createColor('red', 3, 0.6), 8);
  setSquareHighlight('e1', 'white');
  setSquareHighlight('a2', 'blue');
  removeHighlights('white');
  drawSquareContour('g5', 'white');
  drawSquareContour('a8', createColor('blue', 2, 0.6));
  drawSquareContour('b8', 'yellow');
}

$('#startBtn').on('click', start)
$('#clearBtn').on('click', clear)
$('#onlyPawnsBtn').on('click', showPawnStructure)