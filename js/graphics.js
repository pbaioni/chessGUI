var  arrowCanvas, arrowContext, contourCanvas, contourContext, circleCanvas, circleContext
var squareClass = 'square-55d63'
var boardSize=640
var contourWidth = 4
var circleWidth = 4

// arrows layer
arrowCanvas = document.getElementById('arrowCanvas');
arrowContext = arrowCanvas.getContext('2d');
arrowContext.lineJoin = 'butt';

// contours layer
contourCanvas = document.getElementById('contourCanvas');
contourContext = contourCanvas.getContext('2d');
contourContext.lineJoin = 'butt';

// circles layer
circleCanvas = document.getElementById('circleCanvas');
circleContext = circleCanvas.getContext('2d');
circleContext.lineJoin = 'butt';

function createColor(colourName, shade, alpha){
//shade: 1=lightest 5=darkest
var colour, red, green, blue;
switch(colourName) {
    case 'white': red=255; green=255; blue=255; break;
    case 'black': red=0; green=0; blue=0; break;
    case 'yellow': red=255; green=255; blue=(5-shade)*51; break;
    case 'blue': red=(5-shade)*51; green=(5-shade)*51; blue=255; break;
    case 'green': red=(5-shade)*51; green=255; blue=(5-shade)*51; break;
    case 'red': red=255; green=(5-shade)*51; blue=(5-shade)*51; break;
    default:
        red=255; green=255; blue=255; break;
  }
  return 'rgba('+red+', '+green+', '+blue+', '+alpha+')';
}

function drawArrow(depSquare, arrSquare, colour, lineWidth) {
    var offset = 3;
    var pos1 = $board.find('.square-' + depSquare).position();
    var from = {x: pos1.left + (boardSize/(8*2))-offset , y: pos1.top + (boardSize/(8*2))-offset }
    var pos2 = $board.find('.square-' + arrSquare).position();
    var to = {x: pos2.left + (boardSize/(8*2))-offset, y: pos2.top + (boardSize/(8*2))-offset }

    //setting arrow colour
    arrowContext.strokeStyle = arrowContext.fillStyle = colour;

    // offset to allow the arrow head hitting the center of the square
    var xFactor, yFactor;
    if (to.x == from.x) {
        yFactor = Math.sign(to.y - from.y)*lineWidth;
        xFactor = 0
    }
    else if (to.y == from.y) {
        xFactor = Math.sign(to.x - from.x)*lineWidth;
        yFactor = 0;
    }
    else {
        // find delta x and delta y to achieve hypotenuse of arrowWidth
        slope_mag = Math.abs((to.y - from.y)/(to.x - from.x));
        xFactor = Math.sign(to.x - from.x)*lineWidth/Math.sqrt(1 + Math.pow(slope_mag, 2));
        yFactor = Math.sign(to.y - from.y)*Math.abs(xFactor)*slope_mag;
    }

    // draw arrow line
    arrowContext.beginPath();
    arrowContext.lineCap = "round";
    arrowContext.lineWidth = lineWidth;
    arrowContext.moveTo(from.x, from.y);
    arrowContext.lineTo(to.x - xFactor, to.y - yFactor);
    arrowContext.stroke();

    // draw arrow head
    //offsetting final point
    to.x = to.x - xFactor;
    to.y = to.y - yFactor;
	var angle, x, y;
	
	arrowContext.beginPath();
	
	angle = Math.atan2(to.y-from.y,to.x-from.x)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;

	arrowContext.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;
	
	arrowContext.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;
	
	arrowContext.lineTo(x, y);
	arrowContext.closePath();
	arrowContext.fill();
}

function eraseArrows(){
    arrowContext.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
}

function drawCircle(square, colour) {
    var pos = $board.find('.square-' + square).position();
    var center = {x: pos.left + (boardSize/(8*2)) - circleWidth/2, y: pos.top + (boardSize/(8*2)) - circleWidth/2, }
    radius= (boardSize/(8*2)) - circleWidth/2;
    circleContext.strokeStyle = colour;
    circleContext.beginPath();
    circleContext.lineWidth = circleWidth;
    circleContext.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    circleContext.stroke();
}

function eraseCircles(){
    circleContext.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
}

function drawSquareContour(square, colour) {
    var pos = $board.find('.square-' + square).position();
    contourContext.strokeStyle = colour;
    contourContext.lineWidth = contourWidth;
    var length = boardSize/8 - contourWidth;
    contourContext.beginPath();
    contourContext.moveTo(pos.left, pos.top);
    contourContext.lineTo(pos.left, pos.top+length);
    contourContext.lineTo(pos.left+length, pos.top+length);
    contourContext.lineTo(pos.left+length, pos.top);
    contourContext.closePath();
    contourContext.stroke();
}

function eraseContours(){
    contourContext.clearRect(0, 0, contourCanvas.width, contourCanvas.height);
}

function eraseDrawings(){
    eraseArrows()
    eraseCircles()
    eraseContours()
}

function setSquareHighlight(square, highlightColour) {
    $board.find('.square-' + square).addClass('highlight-' + highlightColour)
}

function removeHighlights(colour) {

    if(colour=='all'){
        var colors = new Array('white', 'black', 'red', 'green', 'blue', 'yellow');
        colors.forEach(element => {
            $board.find('.' + squareClass)
            .removeClass('highlight-'+element);
        });
    } else{
        $board.find('.' + squareClass)
        .removeClass('highlight-'+colour);
    }
}



