var  canvas, context

// graphical canvas
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
context.lineJoin = 'butt';

function drawArrow(colour, lineWidth, from, to) {

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

function drawCircle(colour, lineWidth, center, radius) {
    radiusReduction = lineWidth/2;
    context.strokeStyle = colour;
    context.beginPath();
    context.lineWidth = lineWidth;
    context.arc(center.x, center.y, radius-radiusReduction, 0, 2 * Math.PI);
    context.stroke();
}



