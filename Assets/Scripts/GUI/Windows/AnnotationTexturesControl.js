import ApplicationState;

var buttonTexture : Texture2D;
var buttonStyle : GUIStyle;
var guiSkin : GUISkin;
var bottomMenuHeight : int = 25;
var downButtonTexture : Texture2D;
var resizeButtonTexture : Texture2D;
var menuStyle : GUIStyle;
var resizeButtonStyle : GUIStyle;

private var __imagePath : String = "file:///Users/lagoan/Workspace/SET/loadImage.png";
private var __t : Texture2D;
private var __www : WWW;
private var __winRect : Rect;
private var __images : Array;
private var __winIdToImage : Hashtable;
private var __currentlyShowingIndex : int = 0;
private var __renderMenu : boolean;
private var __buttonHeight : int = 15;
private var __buttonPadding : int = 2;
private var __resizing : boolean;
private var __resizingVector : Vector3;
private var __resizingRect : Rect;


function Awake() {
	__winRect = Rect(100,100,128,128);
	__renderMenu = false;
	__resizing = false;

}

function Start() {

}

private function AddIfKeyExists(to : Hashtable, from : Hashtable, key : String) {
	if (from.Contains(key)) {
		to[key] = from[key];
	} else {
		to[key] = false;
	}
}

function FinishInitialization() {
	var imagePaths : Array = new Array();
	__images = new Array();
	__winIdToImage = new Hashtable();
	for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
		// Debug.Log(annotation);
		// get paths
		if (annotation.Contains('image')) {
			// load them
			var www = new WWW(annotation['image']); 
			yield www;
			var t = new Texture2D(4, 4);
			www.LoadImageIntoTexture(t);
			t.Compress(true);
			annotation["imageTexture"] = t;
			// hash 
			var thisImage : Hashtable = new Hashtable();
			// img
			thisImage['image'] = t;
			thisImage['annotationSample'] = annotation["text"].Replace("\n", " ").Substring(0, annotation["text"].length > 20 ? 20 : annotation["text"].length);
			AddIfKeyExists(thisImage, annotation, 'startTime');
			AddIfKeyExists(thisImage, annotation, 'endTime');			
			AddIfKeyExists(thisImage, annotation, 'character');
			thisImage['winId'] = WindowManager.instance.reserveId();
			thisImage['imgRect'] = Rect(0,0,t.width,t.height);
			thisImage['btnRect'] = Rect(0,0,32,32);
			__winIdToImage[thisImage['winId']] = __images.length;

			__images.Push(thisImage);
		}
	}
}

function annotationTexturesWindow(winId : int) {
	
	if (__images.length) {
		var thisImage:Hashtable = __images[__currentlyShowingIndex];
		
		var winRect : Rect = Rect(WindowManager.instance.windowRects[winId].x, 
								  WindowManager.instance.windowRects[winId].y,
								  WindowManager.instance.windowRects[winId].width,
								  WindowManager.instance.windowRects[winId].height);
		winRect.height -= bottomMenuHeight;
		var newWidth : float = 0;
		var newHeight :float  = 0;
		var imageRatio : float = thisImage['image'].width / thisImage['image'].height;
		var winRatio : float = winRect.width / winRect.height;
		
		// hackish
		
		if (winRect.width < winRect.height) {
			newWidth  = winRect.width;
			newHeight  = thisImage['image'].height * winRect.width / thisImage['image'].width;			
			if (newHeight > winRect.height) {
				newHeight  = winRect.height;
				newWidth  = thisImage['image'].width * winRect.height / thisImage['image'].height;
			}			
		} else {
			newHeight  = winRect.height;
			newWidth  = thisImage['image'].width * winRect.height / thisImage['image'].height;
			if (newWidth > winRect.width) {
				newWidth  = winRect.width;
				newHeight  = thisImage['image'].height * winRect.width / thisImage['image'].width;
			}
		}
		
		var centreX : float = winRect.width /2.0 - newWidth /2.0;
		var centreY : float = winRect.height /2.0 - newHeight /2.0;
				
		GUI.DrawTexture(Rect(centreX,
							centreY,
							newWidth,
							newHeight), 
							thisImage['image']);
		var content : GUIContent = new GUIContent();
		content.text = thisImage['annotationSample'];		
		content.image = downButtonTexture;
		
		if (GUI.RepeatButton(Rect( winRect.width - 20, winRect.height + 5, 15, 15), resizeButtonTexture, resizeButtonStyle)) {
			__resizingVector = Input.mousePosition;
			__resizingRect = WindowManager.instance.windowRects[winId];
			__resizing = true;
		}
		
		if (GUI.Button(Rect(10, winRect.height + 5, 123, 15), content )) {
			__renderMenu = true;
		}
		
	
		
	}
	
	if (__resizing) {
		
		WindowManager.instance.windowRects[winId].width = __resizingRect.width + Input.mousePosition.x - __resizingVector.x;
		WindowManager.instance.windowRects[winId].height = __resizingRect.height - Input.mousePosition.y + __resizingVector.y;
		
		if (WindowManager.instance.windowRects[winId].width < 200) {
			WindowManager.instance.windowRects[winId].width = 200;
		}
		
		if (WindowManager.instance.windowRects[winId].height < 150) {
			WindowManager.instance.windowRects[winId].height = 150;
		}
		
		if (Input.GetMouseButtonUp(0)) {
			__resizing = false;
		}
	} else {
		GUI.DragWindow();
		var windowRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_TEXTURES_ID];
	    WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_TEXTURES_ID] = WindowManager.instance.restrictToWindow(windowRect);
	}
}

function annotationTexturesMenuWindow(winId :int) {
	var currentY : int = 2;
	
	for (var thisImage : Hashtable in __images) {
		if (GUI.Button(Rect(2,currentY,125-4,__buttonHeight), thisImage["annotationSample"])) {
			__currentlyShowingIndex = __winIdToImage[thisImage['winId']];
			__renderMenu = false;
		}
		currentY += __buttonHeight + __buttonPadding;
	}
	
	GUI.BringWindowToFront(winId);
}

function OnGUI() {
	GUI.skin = guiSkin;
	
	var winId : int = WindowManager.instance.ANNOTATIONS_TEXTURES_ID;
	GUI.depth = 1;//0
	WindowManager.instance.windowRects[winId]= GUI.Window(winId,
								   WindowManager.instance.windowRects[winId],
								   annotationTexturesWindow,
								   "");
	
	
	GUI.depth = 1;
	
	if (__renderMenu) {
		var menuId : int = WindowManager.instance.ANNOTATIONS_TEXTURES_MENU_ID;
		
		// set rect
		
		WindowManager.instance.windowRects[menuId].x = WindowManager.instance.windowRects[winId].x + 10;
		WindowManager.instance.windowRects[menuId].y = WindowManager.instance.windowRects[winId].y + WindowManager.instance.windowRects[winId].height - 20;
		WindowManager.instance.windowRects[menuId].width = 125;
		WindowManager.instance.windowRects[menuId].height = __images.length * (__buttonHeight + __buttonPadding) + 4;
		
		WindowManager.instance.windowRects[menuId] = GUI.Window(menuId,
									   WindowManager.instance.windowRects[menuId],
									   annotationTexturesMenuWindow,
									   "",
									   menuStyle);
	}
		
	// if show
		
	if (! ApplicationState.instance.loadingNewFile &&  ApplicationState.instance.showAnnotationImages) {
	
		for (var thisImage: Hashtable in __images) {
			
			if (thisImage['endTime'] == false || (thisImage['endTime'] != false && 
			ApplicationState.instance.playTime >= thisImage['startTime'] && 
			ApplicationState.instance.playTime <= thisImage['endTime'])) {
				
				if (thisImage['character']) {
					// modify image rect x and y
					var nameRef : Hashtable = ApplicationState.instance.playStructure["characters"][thisImage['character']];

					var buttonPosn : Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
																					  nameRef["gameObject"].collider.bounds.max.y,
																					  nameRef["gameObject"].transform.position.z));
					thisImage['btnRect'].x = buttonPosn.x + 25;
					thisImage['btnRect'].y = Screen.height - buttonPosn.y ;
				}
				
				if (GUI.Button(thisImage['btnRect'], buttonTexture, buttonStyle)) {
					// show image on images window
					__currentlyShowingIndex = __winIdToImage[thisImage['winId']];
				}			
			}
		}
	}
}

function imageWindowFunction(winId: int) {
	
	var thisImage : Hashtable = __images[__winIdToImage[winId]];
	Debug.Log(thisImage['image']);
	GUI.DrawTexture(Rect(0,
						0,
						thisImage['image'].width,
						thisImage['image'].height), 
						thisImage['image']);
					
	// if (thisImage['character'] == false) {
		GUI.DragWindow();
	// } else {
	// 	var nameRef : Hashtable = ApplicationState.instance.playStructure["characters"][thisImage['character']];
	// 	
	// 	var buttonPosn : Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
	// 																	  nameRef["gameObject"].collider.bounds.max.y,
	// 																	  nameRef["gameObject"].transform.position.z));
	// 	thisImage['rect'].x = buttonPosn.x;
	// 	thisImage['rect'].y = Screen.height- buttonPosn.y;																
	// 	
	// }
	GUI.BringWindowToBack(winId);
	
}

// function windowFunction(winId : int) {
// 	GUI.DrawTexture(Rect(0,0,128,128), __t);
// }