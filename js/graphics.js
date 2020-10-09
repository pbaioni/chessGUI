var  arrowCanvas, arrowContext, contourCanvas, contourContext, tempCanvas, tempContext
var drawingCanvas, drawingContext, progressCanvas, progressContext
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

// temp drawing layer
tempCanvas = document.getElementById('tempCanvas');
tempContext = tempCanvas.getContext('2d');
tempContext.lineJoin = 'butt';

// drawing layer
drawingCanvas = document.getElementById('drawingCanvas');
drawingContext = drawingCanvas.getContext('2d');
drawingContext.lineJoin = 'butt';

// progress bar layer
progressCanvas = document.getElementById('progressCanvas');
progressContext = progressCanvas.getContext('2d');
progressContext.lineJoin = 'butt';


// **** DRAW METHODS ****

function paintMoveAbsolute(move, evaluation){

    //define max evaluation (absolute) for shade arrows
    var shadeLimit = properties.arrowShadeLimit
    var graduation = (Math.abs(evaluation)/shadeLimit)

    //adjust alpha with evaluation
    var alpha = 0.5 + graduation*0.3;

    //calculate arrow color
    var color;
    if(evaluation <= -1000){color = '#9900dd'}
    if(evaluation > -1000 & evaluation < -shadeLimit){color = createColor('red', 1, alpha);};
    if(evaluation >= -shadeLimit & evaluation < 0){color = createColor('orange', graduation, alpha);};
    if(evaluation >= 0 & evaluation <= shadeLimit){color = createColor('green', graduation, alpha);};
    if(evaluation > shadeLimit & evaluation < 1000){color = createColor('cyan', 1, alpha);};
    if(evaluation >= 1000){color = 'black'}

    //paint move arrow
    if(move){
        drawArrow(move.substring(0, 2),move.substring(2, 4), color, properties.moveArrowWidth, 'arrow');
    }
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

function drawArrow(depSquare, arrSquare, colour, lineWidth, layer) {
    context = arrowContext
    if(layer === 'temp'){
        context = tempContext
    }
    if(layer === 'drawing'){
        context = drawingContext
    }
    
    var offset = 3;
    var pos1 = $board.find('.square-' + depSquare).position();
    var from = {x: pos1.left + (boardSize/(8*2))-offset , y: pos1.top + (boardSize/(8*2))-offset }
    var pos2 = $board.find('.square-' + arrSquare).position();
    var to = {x: pos2.left + (boardSize/(8*2))-offset, y: pos2.top + (boardSize/(8*2))-offset }

    //setting arrow colour
    context.strokeStyle = context.fillStyle = colour;

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
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = lineWidth;
    context.moveTo(from.x, from.y);
    context.lineTo(to.x - xFactor, to.y - yFactor);
    context.stroke();

    // draw arrow head
    //offsetting final point
    to.x = to.x - xFactor;
    to.y = to.y - yFactor;
	var angle, x, y;
	
	context.beginPath();
	
	angle = Math.atan2(to.y-from.y,to.x-from.x)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;

	context.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;
	
	context.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = lineWidth*Math.cos(angle) + to.x;
	y = lineWidth*Math.sin(angle) + to.y;
	
	context.lineTo(x, y);
	context.closePath();
	context.fill();
}

function drawCircle(square, colour, layer) {

        var context = drawingContext
        if(layer === 'temp'){
            context = tempContext
        }

        var pos = $board.find('.square-' + square).position();
        var center = {x: pos.left + (boardSize/(8*2)) - circleWidth/2, y: pos.top + (boardSize/(8*2)) - circleWidth/2, }
        radius= (boardSize/(8*2)) - circleWidth/2;
        context.strokeStyle = colour;
        context.beginPath();
        context.lineWidth = circleWidth;
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
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

function drawEvaluationBar(evaluation, boardFlipped, depth){

    //clearing previous evaluation
    progressContext.clearRect(0, 0, progressCanvas.width, progressCanvas.height);
    console.log('depth: ' + depth)
    var lenght;
    var start;
    var color = '#fff'
    var drawReferences = true
    if(depth == 0){
        start = 0
        lenght = 640
        color = '#777'
        drawReferences = false
    }else{
        if(boardFlipped){
            start = 0
            lenght = 320 + (320/400)*evaluation
        }else{
            start = 640
            lenght = 320 - (320/400)*evaluation
        }
    }

    //drawing evaluation bar
    progressContext.strokeStyle = color;
    progressContext.beginPath();
    progressContext.lineWidth = 16;
    progressContext.moveTo(8, start);
    progressContext.lineTo(8, lenght);
    progressContext.stroke();
    progressContext.closePath()

    if(drawReferences){
        //drawing references
        progressContext.strokeStyle = '#a00';
        progressContext.beginPath();
        progressContext.lineWidth = 2;
        progressContext.moveTo(0, 80);
        progressContext.lineTo(16, 80);
        progressContext.moveTo(0, 160);
        progressContext.lineTo(16, 160);
        progressContext.moveTo(0, 240);
        progressContext.lineTo(16, 240);
        progressContext.moveTo(0, 320);
        progressContext.lineTo(16, 320);
        progressContext.moveTo(0, 400);
        progressContext.lineTo(16, 400);
        progressContext.moveTo(0, 480);
        progressContext.lineTo(16, 480);
        progressContext.moveTo(0, 560);
        progressContext.lineTo(16, 560);
        progressContext.stroke();
        progressContext.closePath()

        //drawing 0 mark
        progressContext.beginPath();
        progressContext.arc(8, 320, 2, 0, 2 * Math.PI);
        progressContext.stroke();
    }
    
}

// **** ERASE METHODS ****

function eraseArrows(){
    arrowContext.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
}

function eraseCircle(square){
    var pos = $board.find('.square-' + square).position();
    var length = boardSize/8
    drawingContext.clearRect(pos.left-2, pos.top-2, length, length);
}

function eraseDrawings(){
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function eraseTempContext(){
    tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
}
function eraseContours(){
    contourContext.clearRect(0, 0, contourCanvas.width, contourCanvas.height);
}

function eraseCanvases(){

    //erase all graphics
    eraseArrows()
    eraseContours()
    eraseTempContext()
    eraseDrawings()
}


// **** COLOR METHODS ****

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

async function testColors(){
    eraseCanvases()
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

    await sleep(2000);
}



