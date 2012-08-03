
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
var characterControlsWingStyle : GUIStyle;
var currentActionStyle : GUIStyle;

var characterSubWindowX : int = 0;
var characterSubWindowY : int = 0;

var buttonXPadding : int = 5;
var buttonYStart : int = 22;
var buttonYStep : int = 24;
var buttonSize : int = 24;
var ratio : float;
private var __floatingCamera : boolean;
private var __blocker : Blocker;
private var __cameraManager : ManageCameras;
private var __tempCharacterCamera : boolean;
private var __showSubControls : boolean;
private var buttonDefs : Array;


function Awake()
{
	__floatingCamera = true;
	ApplicationState.instance.floatingCamera = true;
	__tempCharacterCamera = false;
	__blocker = GameObject.Find("Main Camera").GetComponent(Blocker);	
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);
	ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
	//__lastToolTip = "";
	__showSubControls = false;
	InitializeButtons();
}

private function InitializeButtons() {
	buttonDefs = Array();
	buttonDefs.push(Hashtable());
	buttonDefs[0]['name'] = 'Stand';
	buttonDefs[0]['action'] = CharacterActions.Stand;	
	buttonDefs[0]['texture'] = characterStandTexture;
	buttonDefs.push(Hashtable());	
	buttonDefs[1]['name'] = 'Sit';
	buttonDefs[1]['action'] = CharacterActions.Sit;	
	buttonDefs[1]['texture'] = characterSitTexture;
	buttonDefs.push(Hashtable());
	buttonDefs[2]['name'] = 'Kneel';
	buttonDefs[2]['action'] = CharacterActions.Kneel;	
	buttonDefs[2]['texture'] = characterKneelTexture;
	buttonDefs.push(Hashtable());	
	buttonDefs[3]['name'] = 'Lay';
	buttonDefs[3]['action'] = CharacterActions.Lay;	
	buttonDefs[3]['texture'] = characterLayTexture;
}

function OnGUI () {

	GUI.skin = floatingWindowSkin;

	

    // Register the window. Notice the 3rd parameter 
    if ( ! ApplicationState.instance.loadingNewFile && ! ApplicationState.instance.moveCamera && ApplicationState.instance.selectedCharacter) {
		
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
						
						
		if (__showSubControls) {
			
			
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID] = Rect(WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID].x-buttonSize*3 + characterSubWindowX,
																									   WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID].y + characterSubWindowY,
																									   buttonSize*3,buttonSize);

			WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID] = 
				GUI.Window (WindowManager.instance.CHARACTERCONTROLS_SUB_ID, 
							WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID], 
							DoSubCharacterWindow, 
							"",
							characterControlsWingStyle);
		  	GUI.BringWindowToFront(WindowManager.instance.CHARACTERCONTROLS_SUB_ID); 		
		
		
			// if outside of any two rects __showSubControls = false
			var rect1 : Rect = WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_SUB_ID];
			var rect2 : Rect = WindowManager.instance.windowRects[WindowManager.instance.CHARACTERCONTROLS_ID];
			var mouseCoords :Vector2 = Input.mousePosition;
			
			if (!WindowManager.isWindowClicked(mouseCoords, rect2) &&
				!WindowManager.isWindowClicked(mouseCoords, rect1) ) {
					__showSubControls = false;
			}
		}
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
	// var currentStopTexture : Texture2D = ApplicationState.instance.holdingSelectedCharacter ? stopTextureActive : stopTexture;

	

    if (GUI.Button (newPos, 
					GUIContent(stopTexture,
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
	//     newPos.y += buttonYStep;
	// toolPos.y = newPos.y + originRect.y;
	// var currentEditTexture : Texture2D = ApplicationState.instance.editCharacterPaths ? editPathsTextureActive : editPathsTexture;
	// if (GUI.Button (newPos, GUIContent(currentEditTexture, toolPos+"_POSITION-STYLE_" +"Edit paths"))) {
	// 	if (ApplicationState.instance.editCharacterPaths == false ) {
	// 		ApplicationState.instance.editCharacterPaths = true;
	// 		ApplicationState.instance.holdingSelectedCharacter = false;
	// 		ApplicationState.instance.newDestinationSelectedCharacter = false;
	// 	} else {
	// 		ApplicationState.instance.editCharacterPaths = false;
	// 	}
	// 	
	//     } 
	// 
	// separate buttons
	// yCurrent += yStep + 5;
	newPos.y += buttonYStep + 3;
	toolPos.y = newPos.y + originRect.y;
	
	var currentActionTexture : Texture2D;
	
	
	
	var currentAction : CharacterActions;
	
	if(ApplicationState.instance.playStructure['characters'][ApplicationState.instance.selectedCharacter.name]['currentAction']) {
		currentAction = ApplicationState.instance.playStructure['characters'][ApplicationState.instance.selectedCharacter.name]['currentAction'];
	} else {
		currentAction = CharacterActions.Stand;
	}
	
	switch (currentAction) {
		case CharacterActions.Stand:
			currentActionTexture = characterStandTexture;
		break;
		case CharacterActions.Sit:
			currentActionTexture = characterSitTexture;
		break;
		case CharacterActions.Kneel:
			currentActionTexture = characterKneelTexture;
		break;
		case CharacterActions.Lay:
			currentActionTexture = characterLayTexture;
		break;		
	}
	
	
	if (GUI.Button (newPos, GUIContent(currentActionTexture, toolPos+"_POSITION-STYLE_" +"Stand"), currentActionStyle)) {
		//__blocker.addActionCurrentCharacterNow(CharacterActions.Stand);
		
		__showSubControls = true;	
		
	}
	
	// yCurrent += yStep;
	newPos.y += buttonYStep;
	toolPos.y = newPos.y + originRect.y;
	UpdateToolTip();

	GUI.DragWindow();

}

function DoSubCharacterWindow(winId : int) {
	var newPos : Rect;
	var toolPos : Rect;
	var originRect : Rect = Rect(WindowManager.instance.windowRects[winId].x, WindowManager.instance.windowRects[winId].y, 0, 0);
	
	newPos = Rect(0, 0,buttonSize,buttonSize);
	toolPos = newPos;

	var currentCharacter = ApplicationState.instance.selectedCharacter.name;
	var currentAction : CharacterActions;
	
	if (ApplicationState.instance.playStructure['characters'][currentCharacter]['currentAction']) {
		currentAction = ApplicationState.instance.playStructure['characters'][currentCharacter]['currentAction'];
	} else {
		currentAction = CharacterActions.Stand;
	}
	
	for (var i : int = 0 ; i < 4; ++i) {
		var thisAction : CharacterActions = buttonDefs[i]['action'];
		if (currentAction != thisAction) {
			if (GUI.Button (newPos, GUIContent(buttonDefs[i]['texture'] as Texture2D, toolPos+"_POSITION-STYLE_" +buttonDefs[i]['name']))) {
				__blocker.addActionCurrentCharacterNow(buttonDefs[i]['action']);
				__showSubControls = false;
			}
			// yCurrent += yStep;
			newPos.x += buttonYStep;
			toolPos.x = newPos.x + originRect.x;
		}
	}

	
	
}

}
