var  arrowCanvas, arrowContext, contourCanvas, contourContext, circleCanvas, circleContext
var squareClass = 'square-55d63'
var boardSize=640
var contourWidth = 5
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

function createColor(colourName, graduation, alpha){

var red, green, blue;

// full shading
var shade = 255 - graduation*255

//half shading
var halfShade = 255 - (graduation/2)*255

switch(colourName) {
    case 'white': red=255; green=255; blue=255; break;
    case 'black': red=0; green=0; blue=0; break;
    case 'cyan': red=shade; green=255; blue=255; break;
    case 'yellow': red=255; green=255; blue=shade; break;
    case 'orange': red=255; green=halfShade; blue=shade-40; break;
    case 'blue': red=shade; green=shade; blue=255; break;
    case 'green': red=shade; green=255; blue=shade; break;
    case 'red': red=255; green=shade; blue=shade; break;
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

function paintMoveRelative(move, centipawnloss){
    var colour;
    var alpha = 0.5;
    if(centipawnloss<=30){colour = createColor('white', null, alpha);};
    if(centipawnloss>30 & centipawnloss<70){colour = createColor('red', 1, alpha);};
    if(centipawnloss>70 & centipawnloss<120){colour = createColor('red', 2, alpha);};
    if(centipawnloss>120 & centipawnloss<200){colour = createColor('red', 3, alpha);};
    if(centipawnloss>200 & centipawnloss<30){colour = createColor('red', 4, alpha);};
    if(centipawnloss>300 & centipawnloss<500){colour = createColor('red', 5, alpha);};
    if(centipawnloss>500){colour = createColor('black', null, alpha);};

    drawArrow(move.substring(0, 2),move.substring(2, 4), colour, 15);
}

function paintMoveAbsolute(move, evaluation){

    //define max evaluation (absolute) for shade arrows
    var shadeLimit = properties.arrowShadeLimit
    var graduation = (Math.abs(evaluation)/shadeLimit)

    //adjust alpha with evaluation
    var alpha = 0.5 + graduation*0.3;

    //calculate arrow color
    var color;
    if(evaluation < -shadeLimit){color = createColor('red', 1, alpha);};
    if(evaluation >= -shadeLimit & evaluation < 0){color = createColor('orange', graduation, alpha);};
    if(evaluation >= 0 & evaluation <= shadeLimit){color = createColor('green', graduation, alpha);};
    if(evaluation > shadeLimit){color = createColor('cyan', 1, alpha);};

    //paint arrow
    drawArrow(move.substring(0, 2),move.substring(2, 4), color, 15);
}

function paintInfluence(square, influence){

    //define limit for contour shade
    var influenceLimit = properties.contourShadeLimit
    var graduation = (Math.abs(influence)/influenceLimit)

    //adjust alpha with influence
    var alpha = 0.5 + graduation*0.3;

    //calculate contour color
    var color;
    if(influence < -influenceLimit){color = createColor('cyan', 1, alpha);};
    if(influence >= -influenceLimit & influence < 0){color = createColor('cyan', graduation, alpha);};
    if(influence == 0){color = createColor('white', 1, 0.8);};
    if(influence > 0 & influence <= influenceLimit){color = createColor('yellow', graduation, alpha);};
    if(influence > influenceLimit){color = createColor('yellow', 1, alpha);};

    //paint contour
    drawSquareContour(square, color)
}

function testColors(){
    eraseDrawings()
    var tenth = properties.arrowShadeLimit/10
    //good positions
    paintMoveAbsolute('a2a4', 0)
    paintMoveAbsolute('b2b4', tenth)
    paintMoveAbsolute('c2c4', 2*tenth)
    paintMoveAbsolute('d2d4', 3*tenth)
    paintMoveAbsolute('e2e4', 4*tenth)
    paintMoveAbsolute('f2f4', 6*tenth)
    paintMoveAbsolute('g2g4', 10*tenth)
    paintMoveAbsolute('h2h4', 12*tenth)

    //bad positions
    paintMoveAbsolute('a7a5', 0)
    paintMoveAbsolute('b7b5', -tenth)
    paintMoveAbsolute('c7c5', -2*tenth)
    paintMoveAbsolute('d7d5', -3*tenth)
    paintMoveAbsolute('e7e5', -4*tenth)
    paintMoveAbsolute('f7f5', -6*tenth)
    paintMoveAbsolute('g7g5', -10*tenth)
    paintMoveAbsolute('h7h5', -12*tenth)
}



