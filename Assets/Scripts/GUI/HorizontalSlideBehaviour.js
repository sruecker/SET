
public var maxHorizontal : int;
public var minHorizontal : int;
public var xMov : int;

private var __mouseDown : boolean;

private var __offset;

function Awake()
{
	maxHorizontal =  1000000000;	
	minHorizontal = -1000000000;	
	__offset = 0;
	__mouseDown = false;
}


function OnMouseDown()
{
	__offset = Input.mousePosition.x - guiTexture.pixelInset.x;
	__mouseDown = true;
}

function OnMouseUp()
{
	__mouseDown = false;	
}

function isMouseDown() : boolean
{
	return __mouseDown;
}

function OnMouseDrag()
{
	var newPos : int = Input.mousePosition.x - __offset;
	
	xMov = Mathf.Clamp(newPos, minHorizontal, maxHorizontal);
	
	/*
	if (newPos > maxHorizontal) {
		xMov = maxHorizontal;
	} else if ( newPos < minHorizontal) {
		xMov = minHorizontal;
	} else {
		xMov =  newPos;
	}
	*/
	
}

