const NUM_SQUARES = 8;
var  canvas, context

// graphical canvas
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
context.lineJoin = 'butt';

function drawArrowToCanvas(colour, width, headWidth, from, to) {

    context.strokeStyle = context.fillStyle = colour;
    // offset to so the arrow head hits the center of the square
    var xFactor, yFactor;
    if (to.x == from.x) {
        yFactor = Math.sign(to.y - from.y)*width;
        xFactor = 0
    }
    else if (to.y == from.y) {
        xFactor = Math.sign(to.x - from.x)*width;
        yFactor = 0;
    }
    else {
        // find delta x and delta y to achieve hypotenuse of arrowWidth
        slope_mag = Math.abs((to.y - from.y)/(to.x - from.x));
        xFactor = Math.sign(to.x - from.x)*headWidth/Math.sqrt(1 + Math.pow(slope_mag, 2));
        yFactor = Math.sign(to.y - from.y)*Math.abs(xFactor)*slope_mag;
    }

    // draw line
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = 10;
    context.moveTo(from.x, from.y);
    context.lineTo(to.x - xFactor, to.y - yFactor);
    context.stroke();

    // draw arrow head
    to.x = to.x - xFactor;
    to.y = to.y - yFactor;
    drawArrowHead(context, from, to, headWidth);
}

function drawArrowHead(context, from, to, headWidth) {
	var x_center = to.x;
	var y_center = to.y;
	var angle, x, y;
	
	context.beginPath();
	
	angle = Math.atan2(to.y-from.y,to.x-from.x)
	x = headWidth*Math.cos(angle) + x_center;
	y = headWidth*Math.sin(angle) + y_center;

	context.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = headWidth*Math.cos(angle) + x_center;
	y = headWidth*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = headWidth*Math.cos(angle) + x_center;
	y = headWidth*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	context.closePath();
	context.fill();
}

function drawCircle(colour, lineWidth, center, radius) {
    reduction = 2;
    context.strokeStyle = colour;
    context.beginPath();
    context.lineWidth = lineWidth;
    context.arc(center.x, center.y, radius-reduction, 0, 2 * Math.PI);
    context.stroke();
}



