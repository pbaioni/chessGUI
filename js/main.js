// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
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
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

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
  $fen.html('FEN: ' + game.fen())
  $pgn.html('PGN: ' + game.pgn())

  drawCircle(100, 100, 50);
  drawArrowToCanvas(null);
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
}

function clear () {
    board.clear()
    game = new Chess()
}

function showPawnStructure () {
  getOnlyPawns(game.fen()).then(fenWithoutPieces => board.position(fenWithoutPieces)); ;
}

$('#startBtn').on('click', start)
$('#clearBtn').on('click', clear)
$('#onlyPawnsBtn').on('click', showPawnStructure)