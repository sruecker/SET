
import ApplicationState;
import WindowManager;


class SubControlsWindow extends ToolTipSender {
var xOffset : float = 0;
var yOffset : float = 0;
var floatingCameraTexture : Texture2D;
var collisionCameraTexture : Texture2D;
var stopTexture : Texture2D;
var stopTextureActive : Texture2D;
var sitTexture : Texture2D;
var removeCharacterTexture : Texture2D;
var editPathsTexture : Texture2D;
var editPathsTextureActive : Texture2D;
var characterStandTexture : Texture2D;
var characterSitTexture : Texture2D;
var characterKneelTexture : Texture2D;
var characterLayTexture : Texture2D;

var separator : Texture2D;

var pointButtonTexture : Texture2D;
var zoomButtonTexture : Texture2D;
var trackButtonTexture : Texture2D;
var tumbleButtonTexture : Texture2D;

var floatingWindowSkin : GUISkin;

var buttonXPadding : int = 5;
var buttonYStart : int = 22;
var buttonYStep : int = 24;
var buttonSize : int = 24;
var ratio : float;
var buttonNormalStyle : GUIStyle;
var buttonSelectedStyle : GUIStyle;

private var __floatingCamera : boolean;
private var __blocker : Blocker;
private var __cameraManager : ManageCameras;
private var __tempCharacterCamera : boolean;
private var __newCameraControls : NewCameraControls;


function Awake()
{
	__floatingCamera = true;
	ApplicationState.instance.floatingCamera = true;
	__tempCharacterCamera = false;
	__blocker = GameObject.Find("Main Camera").GetComponent(Blocker);	
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);
	__newCameraControls = GameObject.Find("Director").GetComponent(NewCameraControls);
	ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
	//__lastToolTip = "";

}

function OnGUI () {

	GUI.skin = floatingWindowSkin;

    // Register the window. Notice the 3rd parameter 
    if ( ! ApplicationState.instance.moveCamera /*&& ApplicationState.instance.selectedCharacter*/) {

		// var rectHeight : float = WindowManager.instance.windowRects[WindowManager.instance.SUBCONTROLS_ID].height;				  		
		
		// var nameRef :Hashtable = ApplicationState.instance.playStructure["characters"][ApplicationState.instance.selectedCharacter.name];
		// 		// Debug.Log(nameRef);
		// 		var buttonPosn: Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
		// 															nameRef["gameObject"].collider.bounds.max.y,
		// 															nameRef["gameObject"].transform.position.z));
		
		// WindowManager.instance.windowRects[WindowManager.instance.SUBCONTROLS_ID].x = buttonPosn.x + (xOffset * ratio);
		// 		WindowManager.instance.windowRects[WindowManager.instance.SUBCONTROLS_ID].y = Camera.main.pixelHeight - rectHeight - buttonPosn.y - (yOffset * ratio);
		// 	
		if (ApplicationState.instance.showSubcontrols){			
		    WindowManager.instance.windowRects[WindowManager.instance.SUBCONTROLS_ID] = 
				GUI.Window (WindowManager.instance.SUBCONTROLS_ID, 
							WindowManager.instance.windowRects[WindowManager.instance.SUBCONTROLS_ID], 
							DoSubControlsWindow, 
							"", "customWindow");
		}
    }
}

// Make the contents of the window
function DoSubControlsWindow (windowID : int) {


	//yCurrent = buttonYStart;
	//yStep = buttonYStep;
	//xPos = buttonXPadding;
	var originRect : Rect = Rect(WindowManager.instance.windowRects[windowID].x, WindowManager.instance.windowRects[windowID].y, 0, 0);
	var newPos : Rect;
	var toolPos : Rect;
	newPos = Rect(buttonXPadding, buttonYStart,buttonSize,buttonSize);
	toolPos = newPos;
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	
	
	GUI.DrawTexture(Rect(0, 8, WindowManager.instance.windowRects[windowID].width, separator.height), separator);

	
	if (GUI.Button (newPos, GUIContent(pointButtonTexture, toolPos+"_POSITION-STYLE_" + "Point"), buttonNormalStyle) ) {
		__newCameraControls.SetPointer();
	}

	newPos.y += buttonYStep + 3;
  	GUI.DrawTexture(Rect(0, newPos.y, WindowManager.instance.windowRects[windowID].width, separator.height), separator);	
	newPos.y += 6;
	toolPos.y = newPos.y + originRect.y;
	
	if (__floatingCamera) {	
	    if (GUI.Button (newPos, GUIContent(floatingCameraTexture, toolPos+"_POSITION-STYLE_" + "Floating camera"), buttonNormalStyle) ) {
   	        __cameraManager.activateBodyCam();
	        __floatingCamera = ! __floatingCamera;
			ApplicationState.instance.floatingCamera = false;
	    }
	} else {
		if (GUI.Button (newPos, GUIContent(collisionCameraTexture, toolPos+"_POSITION-STYLE_" + "Director camera"), buttonNormalStyle) ) {
	        __cameraManager.activateFlyCam();
	        __floatingCamera = ! __floatingCamera;
			ApplicationState.instance.editCharacterPaths = false;
			ApplicationState.instance.floatingCamera = true;
	    }
	}
	

	newPos.y += buttonYStep + 3;
  	GUI.DrawTexture(Rect(0, newPos.y, WindowManager.instance.windowRects[windowID].width, separator.height), separator);	
	newPos.y += 6;
	toolPos.y = newPos.y + originRect.y;
	
	// temp
	if (GUI.Button (newPos, GUIContent(" Map", toolPos+"_POSITION-STYLE_" + "Minimap"), buttonNormalStyle) ) {
		WindowManager.instance.showMiniMap = ! WindowManager.instance.showMiniMap;
	}
	
	newPos.y += buttonYStep + 3;
  	GUI.DrawTexture(Rect(0, newPos.y, WindowManager.instance.windowRects[windowID].width, separator.height), separator);	
	newPos.y += 6;
	toolPos.y = newPos.y + originRect.y;
	
	
	if (GUI.Button (newPos, GUIContent(zoomButtonTexture, toolPos+"_POSITION-STYLE_" + "Zoom"), buttonNormalStyle) ) {
		__newCameraControls.SetZoom();
	}
	
	newPos.y += buttonYStep + 4;
	toolPos.y = newPos.y + originRect.y;
	
	if (GUI.Button (newPos, GUIContent(tumbleButtonTexture, toolPos+"_POSITION-STYLE_" + "Tumble"), buttonNormalStyle) ) {
		__newCameraControls.SetTumble();

	}
	
	newPos.y += buttonYStep+ 4;
	toolPos.y = newPos.y + originRect.y;
	
	if (GUI.Button (newPos, GUIContent(trackButtonTexture, toolPos+"_POSITION-STYLE_" + "Track"), buttonNormalStyle) ) {
		__newCameraControls.SetTrack();

	}
	
	UpdateToolTip();

	GUI.DragWindow();
	
	var windowRect : Rect = WindowManager.instance.windowRects[windowID];
    WindowManager.instance.windowRects[windowID] = WindowManager.instance.restrictToWindow(windowRect);

}

}
