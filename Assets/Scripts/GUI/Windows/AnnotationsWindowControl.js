

import ApplicationState;


var gSkin : GUISkin;
var annotationStyle : GUIStyle;
var headerStyle : GUIStyle;
var anotationBoxStyle : GUIStyle;
var anotationBoxSelectedStyle : GUIStyle;

var headerTexture : Texture2D;
var headerSceneTexture : Texture2D;
var headerSDTexture : Texture2D;
var headerSDSceneTexture : Texture2D;
var resizeButtonFront : Texture2D;
var resizeButtonStyle : GUIStyle;
var lineBoxStyle : GUIStyle;

var toggleJumpButtonTexture : Texture2D;
var toggleJumpDisabledButtonTexture : Texture2D;
var toggleAnnotationsButtonTexture : Texture2D;
var toggleAnnotationsDisabledButtonTexture : Texture2D;
var toggleSDButtonTexture : Texture2D;
var toggleSDDisabledButtonTexture : Texture2D;



//private var __annotationsWindowRect : Rect;
private var __scrollViewVector : Vector2 = Vector2.zero;

private var __resizingAnnotationsWindow : boolean;

private var __initialXPosResizing : int;
private var __initialWidthResizing : int;
private var __resizeButtonSize : int = 7;

var dockButtonTexture : Texture2D;
var undockButtonTexture : Texture2D;

var dragButtonStyle : GUIStyle; // should be clear
var resizeWindowButtonSize : int = 14;
var resizeWindowButtonTexture : Texture2D;
var resizeWindowButtonStyle : GUIStyle;

private var __initialClick : Vector2;
private var __initialRect : Rect;
private var __resizingWindow : boolean = false;
private var __headerPointerTextures : Hashtable;
private var __headerSquareTextures : Hashtable;

private var __selectedAnotations : Array;
private var __toolTipControl : ToolTipWindow;

private var __annotationPositions : Array;
private var __scrollHeight : float;

private var __jumpingEnabled : boolean = true;
private var __annotationsEnabled : boolean = true;
private var __stageDirectionsEnabled : boolean = true;

// private var __showStageDirectionsDrawer : boolean;
// private var __stageDirectionsDrawerRect : Rect;
// private var __stageDirectoinDrawerScrollPosition : Vector2 = Vector2.zero;

function Awake()
{
	__headerPointerTextures = Hashtable();
	__headerSquareTextures = Hashtable();
	__selectedAnotations = Array();
	doAutoLayout = true;
	//__showStageDirectionsDrawer = true;
	//__stageDirectionsDrawerRect = Rect(0,0,0,0);
}

function Update()
{
	if (__resizingAnnotationsWindow) {
		WindowManager.changeWindowWidth(WindowManager.instance.ANNOTATIONS_ID, __initialWidthResizing - (__initialXPosResizing - Input.mousePosition.x));
		
		if ( ! Input.GetMouseButton(0)) {
			__resizingAnnotationsWindow = false;	
		}
	}	

	if (__resizingWindow) {
		var newHeight : int = __initialRect.height - Input.mousePosition.y + __initialClick.y;
		var newWidth : int = __initialRect.width + Input.mousePosition.x - __initialClick.x;
		
		WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].height = newHeight > 40 ? newHeight : 40;
		WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].width = newWidth > 40 ? newWidth : 40;		
		
		if ( ! Input.GetMouseButton(0)) {
			__resizingWindow = false;	
		}
	}
}


function OnGUI()
{
	GUI.depth = 1;
	GUI.skin = gSkin;
	
	if(WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID]) {
		if (WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].width < 200) {
			WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].width = 200;
		}
		if (WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].height < 150) {
			WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].height = 150;
		}
	}
	
	WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID] = GUI.Window (WindowManager.instance.ANNOTATIONS_ID, 
									   WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID], 
									   windowFunction, 
									   "Notes & SDs");
	if (!WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID]) {
		GUI.BringWindowToBack(WindowManager.instance.ANNOTATIONS_ID);  
	}
	
	// if (__showStageDirectionsDrawer) {
	// 	renderStageDirectionsDrawer();
	// }
	
}

// private function renderStageDirectionsDrawer() {
// 	
// 	
// 	var drawerWidth : int = 200;
// 	var drawerX :int = Screen.width - drawerWidth;
// 	var drawerY : int = 30;
// 	var drawerHeight : int =  Screen.height - drawerY - 10 - (Screen.height - WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].y);
// 	
// 	
// 	__stageDirectionsDrawerRect = Rect(drawerX, drawerY, drawerWidth, drawerHeight);
// 	//__stageDirectionsDrawerRect = Rect(0, 0, 100, 100);
// 	
// 	GUI.BeginGroup(__stageDirectionsDrawerRect);
// 	GUI.depth = 10;
// 	GUI.Box(Rect(0, 0, drawerWidth, drawerHeight), "", lineBoxStyle);
// 	
// 	__stageDirectoinDrawerScrollPosition = GUI.BeginScrollView(Rect(0, 0, drawerWidth, drawerHeight), 
// 															   __stageDirectoinDrawerScrollPosition, Rect (0, 0, 220, 200));
// 	
// 	//GUI.Label(Rect(contentPadding, contentPadding, viewWidth, viewHeight ), lineContent); 
// 	GUI.EndScrollView ();
// 	GUI.EndGroup();
// 	
// }

private function windowFunction (windowID : int) 
{
	var winRect:Rect = WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID];

	var undockingTexture : Texture2D;
	if (WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID]) {
		undockingTexture = dockButtonTexture;
	} else {
		undockingTexture = undockButtonTexture;
	}

	// account for resize button

	// activate / deactivate annotations
	var annotationButtonContent : GUIContent;
	annotationButtonContent = !__annotationsEnabled ? GUIContent(toggleAnnotationsDisabledButtonTexture, "Annotations Disabled") : GUIContent(toggleAnnotationsButtonTexture, "Annotations Enabled");
	if (GUI.Button( Rect(winRect.width - 80 - 5, 5, 16, 16), annotationButtonContent, dragButtonStyle )) {
		__annotationsEnabled = ! __annotationsEnabled;
		
		if (!__annotationsEnabled && !__stageDirectionsEnabled) {
			__stageDirectionsEnabled = true;
		}
	}
	
	// activate / deactivate stage directions
	var stageDirectionsButtonContent : GUIContent;
	stageDirectionsButtonContent = !__stageDirectionsEnabled ? GUIContent(toggleSDDisabledButtonTexture, "SDs Disabled") : GUIContent(toggleSDButtonTexture, "SDs Enabled");
	
	if (GUI.Button( Rect(winRect.width - 60 - 5, 5, 16, 16), stageDirectionsButtonContent, dragButtonStyle )) {
		__stageDirectionsEnabled = ! __stageDirectionsEnabled;
		
		if (!__annotationsEnabled && !__stageDirectionsEnabled) {
			__annotationsEnabled = true;
		}
	}

	// activate / deactivate jump mode
	var jumpButtonContent : GUIContent;
	jumpButtonContent = !__jumpingEnabled ? GUIContent(toggleJumpDisabledButtonTexture, "Jumping Disabled") : GUIContent(toggleJumpButtonTexture, "Jumping Enabled");
	if (GUI.Button( Rect(winRect.width - 40 - 5, 5, 16, 16), jumpButtonContent, dragButtonStyle )) {
		__jumpingEnabled = ! __jumpingEnabled;
	}
	
	// undock / dock button
	if (GUI.Button(Rect(winRect.width - 20 - 5, 5, 16, 16), undockingTexture, dragButtonStyle)) {
		WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] = ! WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID];
		
		if ( WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] ) {
			WindowManager.instance.undock(WindowManager.instance.ANNOTATIONS_ID);
			GUI.BringWindowToFront(WindowManager.instance.ANNOTATIONS_ID);
		} else {
			WindowManager.instance.dock(WindowManager.instance.ANNOTATIONS_ID);
			GUI.BringWindowToBack(WindowManager.instance.ANNOTATIONS_ID);
		}

	}
	
	var resizeButtonPadding : int = WindowManager.instance.isLastWindowOnPanels(WindowManager.instance.ANNOTATIONS_ID) ? 0 : __resizeButtonSize;
	var availableWidth:float = winRect.width - resizeButtonPadding - headerSceneTexture.width - 16; // 16 is scrollbar,
	
	__scrollViewVector = GUI.BeginScrollView(
		Rect(0, 26, winRect.width - resizeButtonPadding, winRect.height - 45),
		__scrollViewVector,
		Rect(0, 0, availableWidth+10, __scrollHeight),
		false,
		true
	);

	
	if (!ApplicationState.instance.loadingNewFile) {
		
		var count : int = 0;
		var currentBoxStyle : GUIStyle;
		var prevPos:float = -5.0;
		var startPos:float;
		var endPos:float;
		var headerHeight:float;
		var textHeight:float;
		var testString:String;
		var scrollTo:float;

		for (var annotation:Hashtable in ApplicationState.instance.playStructure["annotations"]) {

			if ((__annotationsEnabled && !annotation["sd"]) ||
				(__stageDirectionsEnabled && annotation["sd"])) {

				if (annotation.Contains("header")) {
					testString = annotation["header"] + ":";
					headerHeight = headerStyle.CalcHeight(GUIContent(testString), availableWidth);
				} else if (annotation.Contains("character")){
					testString = annotation["character"] + ":";
					headerHeight = headerStyle.CalcHeight(GUIContent(testString), availableWidth);
				} else {
					headerHeight = 0.0;
				}
				testString = annotation["text"];
				textHeight = annotationStyle.CalcHeight(GUIContent(testString), availableWidth);
				
				startPos = prevPos + 10;
				endPos = startPos + headerHeight + textHeight;

				if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) {
					if (annotation["startTime"] <= ApplicationState.instance.playTime) scrollTo = startPos;
				}
			
				if (__selectedAnotations[count++]) {
					currentBoxStyle = anotationBoxSelectedStyle;
				} else {
					currentBoxStyle = anotationBoxStyle;
				}

				GUI.BeginGroup(Rect(0, startPos, availableWidth+10, headerHeight+textHeight), currentBoxStyle);
				if (annotation.Contains("character")) {
					if (!annotation["sd"]) {
						GUI.Label(Rect(5, 0, 18, 18), __headerPointerTextures[annotation["character"]]);
					} else {
						GUI.Label(Rect(5, 0, 18, 18), __headerSquareTextures[annotation["character"]]);
					}
				} else {
					if (!annotation["sd"]) {
						GUI.Label(Rect(5, 0, 18, 18), __headerPointerTextures["scene"]);
					} else {
						GUI.Label(Rect(5, 0, 18, 18), __headerSquareTextures[annotation["scene"]]);
					}
				}
			
				if (annotation.Contains("header")) {
					GUI.Label(Rect(20, -5, availableWidth, headerHeight), annotation["header"] + ":", headerStyle);
				} else if (annotation.Contains("character")){
					GUI.Label(Rect(20, -5, availableWidth, headerHeight), annotation["character"] + ":", headerStyle);
				}
		
				if (ApplicationState.instance.moveCamera) {
					GUI.Label(Rect(20, headerHeight-5, availableWidth, textHeight), annotation["text"], annotationStyle);  
				} else {
					annotation["text"] = GUI.TextArea(Rect(20, headerHeight-5, availableWidth, textHeight), annotation["text"], annotationStyle);
				}
			
				GUI.EndGroup();

				prevPos = endPos;
				
			}

		}

		__scrollHeight = endPos < winRect.height -45 ? winRect.height - 45 : endPos;
		// __scrollHeight = endPos + (winRect.height - (headerHeight + textHeight)*2);
		
		if (__jumpingEnabled && (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged)) {
			__scrollViewVector.y = scrollTo;
		}
	}

	GUI.EndScrollView();

	if (! WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] && 
		! WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID]) {
		if (GUI.RepeatButton(Rect(winRect.width - __resizeButtonSize, 
								  0, 
								  __resizeButtonSize, 
								  WindowManager.instance.getBottomWindowHeight()), 
							 resizeButtonFront, resizeButtonStyle)) {
							
			if ( !__resizingAnnotationsWindow ) {
				__initialXPosResizing = Input.mousePosition.x;
				__initialWidthResizing = winRect.width;
				__resizingAnnotationsWindow = true;
			}
		}
	}
	if ( WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] ) {
		if( GUI.RepeatButton(Rect(winRect.width - resizeWindowButtonSize,
							  	  winRect.height - resizeWindowButtonSize,
							  	  resizeWindowButtonSize,
							  	  resizeWindowButtonSize), 
							resizeWindowButtonTexture,
							resizeWindowButtonStyle) ) {
			__resizingWindow = true;
			__initialClick = Input.mousePosition;
			__initialRect = winRect;
		}
	}
	
	if ( WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] ) {
		GUI.DragWindow(Rect(0, 0, 1000000, 30)); // 30 is the height of the window header
	}
	
}


function selectAnotationState(index : int) {
	if (index < __selectedAnotations.length && index >= 0) {
		__selectedAnotations[index] = true;
	}
}

function deselectAnotationState(index : int) {
	if (index < __selectedAnotations.length && index >= 0) {
		__selectedAnotations[index] = false;
	}
}

function changeAnotationState(index : int) {
	if (index < __selectedAnotations.length && index >= 0) {
		__selectedAnotations[index] = ! __selectedAnotations[index];
	}
}

function getAnnotation(index : int)
{
	var result : String = "";
	
	if (ApplicationState.instance.playStructure["annotations"][index].Contains("header")) {
		result += ApplicationState.instance.playStructure["annotations"][index]["header"] + ":";
	} else if (ApplicationState.instance.playStructure["annotations"][index].Contains("character")){
		result += ApplicationState.instance.playStructure["annotations"][index]["character"] + ":";
	}

	result += ApplicationState.instance.playStructure["annotations"][index]["text"];  
	return result;
}

function createHeaderTextures(characterKeys : Array)
{
	__headerPointerTextures["scene"] = Instantiate(headerSceneTexture);
	__headerSquareTextures["scene"] = Instantiate(headerSDSceneTexture);
	
	for (characterKey in characterKeys) {
		
		// annotation
		
		__headerPointerTextures[characterKey] = Instantiate(headerTexture);
		
		var color : Color = ApplicationState.instance.playStructure["characters"][characterKey]["color"];
		
		for (var i:int =0; i<__headerPointerTextures[characterKey].width; i++ ) {
			for (var j:int =0 ; j<__headerPointerTextures[characterKey].height; j++) {
				__headerPointerTextures[characterKey].SetPixel(i, j, __headerPointerTextures[characterKey].GetPixel(i,j) * color);
			}
		}
		__headerPointerTextures[characterKey].Apply();
		
		// stage direction
		
		__headerSquareTextures[characterKey] = Instantiate(headerSDTexture);

		color = ApplicationState.instance.playStructure["characters"][characterKey]["color"];

		for (i =0; i<__headerSquareTextures[characterKey].width; i++ ) {
			for (j =0 ; j<__headerSquareTextures[characterKey].height; j++) {
				__headerSquareTextures[characterKey].SetPixel(i, j, __headerSquareTextures[characterKey].GetPixel(i,j) * color);
			}
		}
		__headerSquareTextures[characterKey].Apply();
		
	}
	
}

public function FinishInitialization()
{
	__scrollHeight = WindowManager.instance.windowRects[WindowManager.instance.ANNOTATIONS_ID].height;
	createHeaderTextures(ApplicationState.instance.playStructure["characters"].Keys);
	
	__selectedAnotations.Clear();
	
	var count : int = 0;
	for (var annotation in ApplicationState.instance.playStructure["annotations"]) {
		__selectedAnotations[count++] = false;
	}
	
}