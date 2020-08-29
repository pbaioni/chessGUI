const NUM_SQUARES = 8;
var colour, canvas, context, initialPoint, finalPoint, arrowWidth

colour = 'rgb(50, 104, 168)' ;

// arrow canvas
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
setContextStyle(context);

// initialise vars
initialPoint = { x: 200, y: 200 };
finalPoint = { x: 0, y: 0 };
arrowWidth = 15;

function setContextStyle(context) {
    context.strokeStyle = context.fillStyle = colour;
    context.lineJoin = 'butt';
}

function drawArrowToCanvas() {
    // offset finalPoint so the arrow head hits the center of the square
    var xFactor, yFactor;
    if (finalPoint.x == initialPoint.x) {
        yFactor = Math.sign(finalPoint.y - initialPoint.y)*arrowWidth;
        xFactor = 0
    }
    else if (finalPoint.y == initialPoint.y) {
        xFactor = Math.sign(finalPoint.x - initialPoint.x)*arrowWidth;
        yFactor = 0;
    }
    else {
        // find delta x and delta y to achieve hypotenuse of arrowWidth
        slope_mag = Math.abs((finalPoint.y - initialPoint.y)/(finalPoint.x - initialPoint.x));
        xFactor = Math.sign(finalPoint.x - initialPoint.x)*arrowWidth/Math.sqrt(1 + Math.pow(slope_mag, 2));
        yFactor = Math.sign(finalPoint.y - initialPoint.y)*Math.abs(xFactor)*slope_mag;
    }

    // draw line
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = 10;
    context.moveTo(initialPoint.x, initialPoint.y);
    context.lineTo(finalPoint.x - xFactor, finalPoint.y - yFactor);
    context.stroke();

    // draw arrow head
    drawArrowHead(context, initialPoint.x, initialPoint.y, finalPoint.x - xFactor, finalPoint.y - yFactor, arrowWidth);
}

function drawArrowHead(context, fromx, fromy, tox, toy, r) {
	var x_center = tox;
	var y_center = toy;
	var angle, x, y;
	
	context.beginPath();
	
	angle = Math.atan2(toy-fromy,tox-fromx)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;

	context.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	context.closePath();
	context.fill();
}

function drawCircle(x, y, r) {
    console.log('draw circle');
    context.beginPath();
    context.lineWidth = 5;
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.stroke();
}



