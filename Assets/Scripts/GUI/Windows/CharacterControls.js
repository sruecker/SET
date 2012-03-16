
import ApplicationState;
import WindowManager;


class CharacterControls extends ToolTipSender {
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
var floatingWindowSkin : GUISkin;
var characterControlsStyle : GUIStyle;

var buttonXPadding : int = 5;
var buttonYStart : int = 22;
var buttonYStep : int = 24;
var buttonSize : int = 24;
var ratio : float;
private var __floatingCamera : boolean;
private var __blocker : Blocker;
private var __cameraManager : ManageCameras;
private var __tempCharacterCamera : boolean;



function Awake()
{
	__floatingCamera = true;
	ApplicationState.instance.floatingCamera = true;
	__tempCharacterCamera = false;
	__blocker = GameObject.Find("Main Camera").GetComponent(Blocker);	
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);
	ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
	//__lastToolTip = "";

}

function OnGUI () {

	GUI.skin = floatingWindowSkin;

	

    // Register the window. Notice the 3rd parameter 
    if ( ! ApplicationState.instance.moveCamera && ApplicationState.instance.selectedCharacter) {
		
		var rectHeight : float = WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID].height;				  		
		
		var nameRef :Hashtable = ApplicationState.instance.playStructure["characters"][ApplicationState.instance.selectedCharacter.name];
		// Debug.Log(nameRef);
		var buttonPosn: Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
															nameRef["gameObject"].collider.bounds.max.y,
															nameRef["gameObject"].transform.position.z));
		
		var winRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID];
		
		winRect.x = buttonPosn.x + (xOffset);
		winRect.y = Camera.main.pixelHeight - rectHeight - buttonPosn.y - (yOffset);
		
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID] = WindowManager.instance.restrictToViewPort(winRect);
		
		var newStyle : GUIStyle = new GUIStyle(characterControlsStyle);
		newStyle.normal.background = nameRef["characterControls"];
		
	    WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID] = 
			GUI.Window (WindowManager.instance.CHARACTERCONTROLS_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID], 
						DoSubControlsWindow, 
						"",
						newStyle);
    }
}

// Make the contents of the window
function DoSubControlsWindow (windowID : int) {


	// yCurrent = buttonYStart;
	// yStep = buttonYStep;
	// xPos = buttonXPadding;
	var originRect : Rect = Rect(WindowManager.instance.windowRects[windowID].x, WindowManager.instance.windowRects[windowID].y, 0, 0);
	var newPos : Rect;
	var toolPos : Rect;
	newPos = Rect(buttonXPadding, buttonYStart,buttonSize,buttonSize);
	toolPos = newPos;
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	
	
	// if (__floatingCamera) {	
	//     if (GUI.Button (newPos, GUIContent(floatingCameraTexture, toolPos+"_POSITION-STYLE_" + "Floating camera"))) {
	//    	        __cameraManager.activateBodyCam();
	//         __floatingCamera = ! __floatingCamera;
	// 		ApplicationState.instance.floatingCamera = false;
	//     }
	// } else {
	// 	if (GUI.Button (newPos, GUIContent(collisionCameraTexture, toolPos+"_POSITION-STYLE_" + "Director camera"))) {
	//         __cameraManager.activateFlyCam();
	//         __floatingCamera = ! __floatingCamera;
	// 		ApplicationState.instance.editCharacterPaths = false;
	// 		ApplicationState.instance.floatingCamera = true;
	//     }
	// }
	//         
	//     // yCurrent += yStep;
	//     newPos.y += buttonYStep;
	// toolPos.y = newPos.y + originRect.y;
	var currentStopTexture : Texture2D = ApplicationState.instance.holdingSelectedCharacter ? stopTextureActive : stopTexture;

    if (GUI.Button (newPos, 
					GUIContent(currentStopTexture, 
							   toolPos+"_POSITION-STYLE_" +"Hold character in position"))) {
    	// add standing stop to currentcharacter
    	//__blocker.addStopCurrentCharacter();
		if (ApplicationState.instance.selectedCharacter != null &&
			ApplicationState.instance.holdingSelectedCharacter == false) {
			ApplicationState.instance.editCharacterPaths = false;
			ApplicationState.instance.holdingSelectedCharacter = true;
			ApplicationState.instance.newDestinationSelectedCharacter = false;
			
			__blocker.waitToAddStopCurrentCharacter();
		} else {
			ApplicationState.instance.holdingSelectedCharacter = false;
		}
    }
  	// yCurrent += yStep;
  	//     
  	// if (GUI.Button (Rect (xPos, yCurrent,buttonSize,buttonSize), GUIContent(removeCharacterTexture, "Remove character"))) {
  	// 	__blocker.removeCurrentCharacter();    
  	//     }

	//yCurrent += yStep;
    newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	var currentEditTexture : Texture2D = ApplicationState.instance.editCharacterPaths ? editPathsTextureActive : editPathsTexture;
	if (GUI.Button (newPos, GUIContent(currentEditTexture, toolPos+"_POSITION-STYLE_" +"Edit paths"))) {
		if (ApplicationState.instance.editCharacterPaths == false ) {
			ApplicationState.instance.editCharacterPaths = true;
			ApplicationState.instance.holdingSelectedCharacter = false;
			ApplicationState.instance.newDestinationSelectedCharacter = false;
		} else {
			ApplicationState.instance.editCharacterPaths = false;
		}
		
    } 
	
	// separate buttons
	// yCurrent += yStep + 5;
	newPos.y += buttonYStep + 5;
	toolPos.y = newPos.y + originRect.y;
	
	if (GUI.Button (newPos, GUIContent(characterStandTexture, toolPos+"_POSITION-STYLE_" +"Stand"))) {
		//__blocker.addActionCurrentCharacterNow(CharacterActions.Stand);
		Debug.Log("create new window");
		
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID] = 
			GUI.Window (WindowManager.instance.CHARACTERCONTROLS_SUB_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID], 
						DoSubCharacterWindow, 
						"");
		
		
	}
	// yCurrent += yStep;
	newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	if (GUI.Button (newPos, GUIContent(characterSitTexture, toolPos+"_POSITION-STYLE_" +"Sit"))) {
		__blocker.addActionCurrentCharacterNow(CharacterActions.Sit);
	}
	// yCurrent += yStep;
	newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	if (GUI.Button (newPos, GUIContent(characterKneelTexture, toolPos+"_POSITION-STYLE_" +"Kneel"))) {
		__blocker.addActionCurrentCharacterNow(CharacterActions.Kneel);		
	}
	// yCurrent += yStep;
	newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	if (GUI.Button (newPos, GUIContent(characterLayTexture, toolPos+"_POSITION-STYLE_" +"Lay"))) {
		__blocker.addActionCurrentCharacterNow(CharacterActions.Lay);		
	}
	// yCurrent += yStep;
	newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	UpdateToolTip();

	GUI.DragWindow();

}

function DoSubCharacterWindow(winId : int) {
	
}

}
