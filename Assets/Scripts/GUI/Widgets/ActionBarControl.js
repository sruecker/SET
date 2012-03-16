
var leftButtonTexture : Texture2D;
var middleButtonTexture : Texture2D;
var rightButtonTexture : Texture2D;
var actionMarkerTexture : Texture2D;
var actionMarkerSize : int = 16;

var actionBarHeight : int = 20;
var resizeButtonWidth : int = 8;
var actionLocation : Array;
var actionLocationSize : int;
private var __leftDragging : boolean = false;
private var __middleDragging : boolean = false;
private var __rightDragging : boolean = false;

private var __initialXPosDragging : int = 0;
private var __initialActionBarX : int = 0;
private var __initialActionBarWidth : int = 0;
private var __leftButtonStyle : GUIStyle;
private var __middleButtonStyle : GUIStyle;
private var __rightButtonStyle : GUIStyle;

private var __localLeftButtonTexture : Texture2D;
private var __localMiddleButtonTexture : Texture2D;
private var __localRightButtonTexture : Texture2D;
private var __localActionMarkerTexture : Texture2D;

private var __actionBarRect : Rect = Rect(0, 0, 100, actionBarHeight);
private var __originalRect: Rect;

function Awake () {
	__leftButtonStyle = new GUIStyle();
	__middleButtonStyle = new GUIStyle();
	__rightButtonStyle = new GUIStyle();

	actionLocation = new Array();
	
	// copy textures
	
	__localLeftButtonTexture = new Texture2D(leftButtonTexture.width,
											 leftButtonTexture.height);
	__localMiddleButtonTexture = new Texture2D(middleButtonTexture.width,
											   middleButtonTexture.height);
	__localRightButtonTexture = new Texture2D(rightButtonTexture.width,
											  rightButtonTexture.height);
	__localActionMarkerTexture = new Texture2D(actionMarkerTexture.width,
											   actionMarkerTexture.height);
	
	__localLeftButtonTexture.SetPixels( leftButtonTexture.GetPixels() );
	__localMiddleButtonTexture.SetPixels( middleButtonTexture.GetPixels() );
	__localRightButtonTexture.SetPixels( rightButtonTexture.GetPixels() );	
    __localActionMarkerTexture.SetPixels( actionMarkerTexture.GetPixels() ); 
	
	assignButtonTextures();
	
}

function setRect(x : int , y : int, w : int, h : int) {
	__actionBarRect = Rect(x, y, w, actionBarHeight);
	
	//__originalRect = __actionBarRect;
}


function setRect(rect : Rect) {
	__actionBarRect = rect;
	__actionBarRect.height = actionBarHeight;
	//__originalRect = __actionBarRect;
	
}


function initRect(rect : Rect) {
	__actionBarRect = rect;
	__actionBarRect.height = actionBarHeight;
	__originalRect = __actionBarRect;
}

function getRect() : Rect {
	return __actionBarRect;
}


function ForOnGUI () {
	

	// draw action markers
	
	var newLocation : float;
	
	GUI.BeginGroup(__actionBarRect);
	for (location in actionLocation) {
		actionLocationSize = actionLocation.length;
		newLocation = (location - __actionBarRect.x) * 
					  (__actionBarRect.width / __originalRect.width);
		GUI.Label(Rect(newLocation - actionMarkerSize / 2,
					   2,
					   actionMarkerSize,
					   actionMarkerSize),
				  __localActionMarkerTexture);
	}
	
	GUI.EndGroup();
	
	// create the buttons
	
	// left
	if ( GUI.RepeatButton(Rect(__actionBarRect.x, 
							   __actionBarRect.y, 
							   resizeButtonWidth, 
							   actionBarHeight),
	 					  "",
						  __leftButtonStyle) ) {
		if ( ! __leftDragging ) {
			__initialActionBarX = __actionBarRect.x;
			__initialActionBarWidth = __actionBarRect.width;
			__initialXPosDragging = Input.mousePosition.x;
			__leftDragging = true;
		}
	}
	
	// middle
	if ( GUI.RepeatButton(Rect(__actionBarRect.x + resizeButtonWidth, 
							   __actionBarRect.y, 
							   __actionBarRect.width - (2 * resizeButtonWidth), 
							   actionBarHeight),
	 					  "",
						  __middleButtonStyle) ) {
		if ( ! __middleDragging ) {
			__initialActionBarX = __actionBarRect.x ;
			__initialXPosDragging = Input.mousePosition.x;
			__middleDragging = true;
		}
	}
	
	// right
	if ( GUI.RepeatButton(Rect(__actionBarRect.x + __actionBarRect.width - resizeButtonWidth, 
							   __actionBarRect.y, 
							   resizeButtonWidth, 
							   actionBarHeight),
	 					  "",
						  __rightButtonStyle) ) {
		if ( ! __rightDragging ) {
			__initialActionBarWidth = __actionBarRect.width;
			__initialXPosDragging = Input.mousePosition.x;
			__rightDragging = true;
		}
	}
	
}

function Update() {
	var changesInX : int;
	// left
	if (__leftDragging) {
		changesInX = Input.mousePosition.x - __initialXPosDragging;
		
		if (__initialActionBarWidth - changesInX > 2 *  resizeButtonWidth) {
			__actionBarRect.x = __initialActionBarX + changesInX;
			__actionBarRect.width = __initialActionBarWidth - changesInX;
		}
		if ( ! Input.GetMouseButton(0)) {
				__leftDragging = false;	
		}
	}
	// middle
	
	if (__middleDragging) {
				
		__actionBarRect.x = __initialActionBarX + 
						  Input.mousePosition.x - 
						  __initialXPosDragging;
	
		
		if ( ! Input.GetMouseButton(0)) {
			__middleDragging = false;	
		}
	}
	
	// right
	if (__rightDragging) {
		changesInX = Input.mousePosition.x - __initialXPosDragging;

		if (__initialActionBarWidth - changesInX > 2 *  resizeButtonWidth) {
			__actionBarRect.width = __initialActionBarWidth + changesInX;
		}
		if ( ! Input.GetMouseButton(0)) {
			__rightDragging = false;	
		}
	}
}

private function assignButtonTextures()
{
	__leftButtonStyle.normal.background = __localLeftButtonTexture;
	__middleButtonStyle.normal.background = __localMiddleButtonTexture;
	__rightButtonStyle.normal.background = __localRightButtonTexture;
	
	__middleButtonStyle.border.left =
	__middleButtonStyle.border.right = __localMiddleButtonTexture.height / 2.0;

}

function setColor( newColor : Color)
{
	changeTextureColor(__localLeftButtonTexture, newColor);
	changeTextureColor(__localMiddleButtonTexture, newColor);
	changeTextureColor(__localRightButtonTexture, newColor);
	changeTextureColor(__localActionMarkerTexture, newColor);
	
	assignButtonTextures();
}

private function changeTextureColor(tex : Texture2D, newColor : Color) 
{
	
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {
			if (tex.GetPixel(i,j).a) {
				tex.SetPixel(i, j,  newColor);
			}
		}
	}
	tex.Apply();
	
}