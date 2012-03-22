

import ApplicationState;
import WindowManager;


class OnStageWindowControl extends ToolTipSender {

var gSkin : GUISkin;
var windowWidth : int = 200;
var characterRowStyle : GUIStyle;
var selectedCharacterRowStyle : GUIStyle;
var resizeButtonFront : Texture2D;
var resizeButtonStyle : GUIStyle;

var secondTimeLineMarker : Texture2D;
var secondTimeLineStyle : GUIStyle;

var addButtonTexture : Texture2D;
var trashButtonTexture : Texture2D;
var emptyGUIStyle : GUIStyle;
var characterCountStyle : GUIStyle;
var optionsButtonStyle : GUIStyle;

var circleTextureSmall : Texture2D;
var circleTextureBig : Texture2D;

var speechActionBarTexture : Texture2D;
var presenceActionBarTexture : Texture2D;
var presenceActionBarOpenTexture : Texture2D;
var presenceActionBarOpenLeftTexture : Texture2D;
var presenceActionBarOpenRightTexture : Texture2D;

var characterAnotationBarTexture : Texture2D;
var characterAnotationDotTexture : Texture2D;

var eyeOpenTexture : Texture2D;
var eyeCloseTexture : Texture2D;

var menuStyle : GUIStyle;
var menuButtonStyle : GUIStyle;
var menuRightArrowTexture : Texture2D;

var colorChangePreviewTexture : Texture2D;

var speechActionBarStyle : GUIStyle;
var presenceActionBarStyle : GUIStyle;

private var __characterAnotationBarStyles : Hashtable;
private var __characterAnotationDotStyles : Hashtable;
private var __characterSpeechStyles : Hashtable;
private var __characterPresenceStyles : Hashtable;
private var __characterPresenceOpenStyles : Hashtable;
private var __characterPresenceOpenLeftStyles : Hashtable;
private var __characterPresenceOpenRightStyles : Hashtable;

private var __newCharacterPosition : GameObject;

//var characterAnootationBarStyle : GUIStyle;
//var characterAnootationDotStyle : GUIStyle;


private var __resizingCharacterWindow : boolean;
private var __resizingOnStageWindow : boolean;

private var __initialXPosResizing : int;
private var __initialWidthResizing : int;


private var __characterKeysShowing : Array = Array();
private var __characterKeysShowingIndexes : Hashtable = Hashtable();
//private var __selectedCharacter : String;

//private var __characterGUIContents : Hashtable = Hashtable();
private var __resizeButtonSize : int = 7;

private var __breakMainTimeLineInCount : float = 7.0;
private var __scalingFactor : float = 1.0;
private var __topPadding : int = 28;

private var __characterActionBars : Hashtable;

private var __presenceActionBars : Hashtable;
private var __speechActionBars : Hashtable;

private var __characterAnnotationBars : Hashtable;
private var __characterAnnotationIndexes : Hashtable;

private var __timeLine : TimeLine;
private var __mainTimeLine : TimeLine;
private var __lowerButtonSize : int = 13;

private var __scrollViewVector : Vector2 = Vector2.zero;
private var __blockerComponent : Blocker;
private var __prevWorkingArea : float = 1.0;

private var __showFirstMenu : boolean;
private var __showPopUpCharMenu : boolean;
private var __popUpCharMenuPos : Vector2;
private var __lastToolTip : String;
private var __menu_1_onmouse : boolean;
private var __menu_2_onmouse : boolean;
private var __menu_1_width : int;
private var __menu_1_height : int;
private var __menu_name_width : int;
private var __currentColor : Color;
private var __lastColor : Color;
private var __startChangingColor : boolean;

private var __annotationsWindowControl : AnnotationsWindowControl;

private var __MENU_1_ONMOUSE : String = "__MENU_1_ONMOUSE";
private var __TYPE_ONMOUSE : String   = "__TYPE_ONMOUSE";
private var __COLOUR_ONMOUSE : String = "__COLOUR_ONMOUSE";
private var __NAME_ONMOUSE : String   = "__NAME_ONMOUSE";
private var __REMOVE_ONMOUSE : String   = "__REMOVE_ONMOUSE";
private var __ANNOTATION_ONMOUSE : String = "__ANNOTATION_ONMOUSE";

private var __dragging : boolean = false;
private var __initialXPosDragging : float = 0;
private var __previousTime : float = 0;

private var __prevPresenceWorkingArea : float = Mathf.Infinity;
private var __showAnnotationTooltip : boolean;
private var __changedAnnotationState : boolean;
private var __selectedAnnotation : int =0;
private var __startedCountingAt : float;
//private var __NO_SELECTION : String  = "__NO_SELECTION";


function Awake()
{
	__resizingCharacterWindow = false;
	__resizingOnStageWindow = false;	
	__timeLine = GetComponent(TimeLine);
	__timeLine.drawAnotations = true;
	__mainTimeLine = GameObject.Find("TimeLineWindow").GetComponent(TimeLine);
	__blockerComponent = GameObject.Find("Main Camera").GetComponent(Blocker);

	ApplicationState.instance.selectedCharacter = null;
	//__selectedCharacter = __NO_SELECTION;
	Random.seed = 42;
	__showFirstMenu = false;
	__showPopUpCharMenu = false;
	__menu_1_onmouse = false;
	__menu_2_onmouse = false;
	__menu_1_width = 70;
	__menu_1_height = 90;
	__menu_name_width = 150;
	__currentColor = Color(0.5,0.5,0.5);
	__lastColor = Color(0.5,0.5,0.5);
	__startChangingColor = true;
	__showAnnotationTooltip = false;
	__changedAnnotationState = false;
}

function Start()
{
	__annotationsWindowControl = GameObject.Find("AnnotationsWindow").GetComponent(AnnotationsWindowControl);
	colorChangePreviewTexture = Instantiate(colorChangePreviewTexture);
}

function Update()
{

	var winRect:Rect = WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID];
	var trueWinWidth:float = winRect.width - __resizeButtonSize;
	
	var workingArea : float = trueWinWidth * __breakMainTimeLineInCount;

	if (__dragging) {
	
		var markerPosition : float = ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / __breakMainTimeLineInCount);
		markerPosition = Mathf.Floor(markerPosition);
		
		var newPercentage : float = (Input.mousePosition.x - winRect.x) / trueWinWidth;
		if (newPercentage < 0.0) {
			newPercentage = 0.0;
		} else if (newPercentage >= 1.0) {
			newPercentage = 0.999;
		}
		markerPosition += newPercentage;
		
		ApplicationState.instance.playTime = ApplicationState.instance.playTimeLength * markerPosition / __breakMainTimeLineInCount;
		ApplicationState.instance.playingForward = ApplicationState.instance.playTime > __previousTime;
		__previousTime = ApplicationState.instance.playTime;
		
		if (!Input.GetMouseButton(0)) {
			__dragging = false;	
		}
	}
	
	if (__resizingCharacterWindow) {
			
		WindowManager.changeWindowWidth(WindowManager.instance.CHARACTER_ID, __initialWidthResizing - (__initialXPosResizing - Input.mousePosition.x));
		WindowManager.instance.windowUpdate[WindowManager.instance.ONSTAGE_ID] = true;
 		
		
		if ( ! Input.GetMouseButton(0)) {
			__resizingCharacterWindow = false;	
		}
	}
	
	if (__resizingOnStageWindow) {
							
		WindowManager.changeWindowWidth(WindowManager.instance.ONSTAGE_ID, __initialWidthResizing - (__initialXPosResizing - Input.mousePosition.x));
 		WindowManager.instance.windowUpdate[WindowManager.instance.ONSTAGE_ID] = true;

		if ( ! Input.GetMouseButton(0)) {
			__resizingOnStageWindow = false;	
		}
	} 
	
	if (WindowManager.instance.windowUpdate[WindowManager.instance.ONSTAGE_ID]) {
		WindowManager.instance.windowUpdate[WindowManager.instance.ONSTAGE_ID] = false;
		
		__timeLine.timeLineWidth = trueWinWidth;

		__timeLine.modifyFromWidth(__prevWorkingArea);
 		//modifyCharacterActionBarsFromWidth(__prevWorkingArea);
		
	}
	__prevWorkingArea = workingArea;
}


function OnGUI()
{
	
	GUI.skin = gSkin;
	
	//__workingArea = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
/*
	GUI.BeginGroup(WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID]);
	characterWindowFunction(WindowManager.instance.CHARACTER_ID);
	GUI.EndGroup();
	
	GUI.BeginGroup(WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID]);
	onStageWindowFunction(WindowManager.instance.ONSTAGE_ID);
	GUI.EndGroup();
*/	
	if (! ApplicationState.instance.loadingNewFile) {
	
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID] = GUI.Window(WindowManager.instance.CHARACTER_ID, 
										   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID], 
										   characterWindowFunction, 
										   "Character");
	
		WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID] = GUI.Window (WindowManager.instance.ONSTAGE_ID, 
										   WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID], 
										   onStageWindowFunction, 
										   ""); // On Stage
									   
		
		GUI.BringWindowToBack(WindowManager.instance.CHARACTER_ID);								   
		GUI.BringWindowToBack(WindowManager.instance.ONSTAGE_ID);	
	
		if (__showPopUpCharMenu) {
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].width = 100;
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].height = 70;
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].x = __popUpCharMenuPos.x;
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].y = __popUpCharMenuPos.y;

			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
				GUI.Window(WindowManager.instance.CHARACTER_MENU_2_ID,
						   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID],
						   createRemoveMenu,
						   GUIContent("", "Remove Character"), menuStyle);
		}
	}
		
}

private function characterWindowFunction (windowID : int) 
{
	// two groups allows to move the group following the scroll view from
	// the onstage window
	
	GUI.BeginGroup(Rect(0,
						26,
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width - __resizeButtonSize,
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].height - 45));
	
	GUI.BeginGroup(Rect(0,
						-1 * __scrollViewVector.y - 26,
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width - __resizeButtonSize,
						10000000));
	
	// character labels

	GUILayout.BeginVertical();
	var currentBackgroundStyle : GUIStyle;
	var currentPathButtonTexture : Texture2D;
	for (var characterKey in __characterKeysShowing) {
						
		if (ApplicationState.instance.selectedCharacter != null && 
			characterKey == ApplicationState.instance.selectedCharacter.name) {
			
			currentBackgroundStyle = selectedCharacterRowStyle;		
		} else {
			currentBackgroundStyle = characterRowStyle;
		}
		
		
		GUILayout.BeginHorizontal();
		var drawCurrentPath : boolean = ApplicationState.instance.playStructure["characters"][characterKey]["drawPath"];
		
		currentPathButtonTexture = drawCurrentPath ? eyeOpenTexture : eyeCloseTexture;
		
		currentBackgroundStyle.stretchWidth = false;
		
		if (GUILayout.Button(currentPathButtonTexture, currentBackgroundStyle) ) {
			ApplicationState.instance.playStructure["characters"][characterKey]["drawPath"] = ! drawCurrentPath;
			ApplicationState.instance.redrawSurfacePaths = true;
			if (ApplicationState.instance.editCharacterPaths) {
				__blockerComponent.resetMarkers();
			}
		}
		currentBackgroundStyle.stretchWidth = true;
		
		
		if (GUILayout.Button(GUIContent(ApplicationState.instance.playStructure["characters"][characterKey]["name"] as String, 
										ApplicationState.instance.playStructure["characters"][characterKey]["mug"] as Texture), 
							 currentBackgroundStyle)) {
			if (ApplicationState.instance.selectedCharacter == null || 
				characterKey != ApplicationState.instance.selectedCharacter.name) {
				ApplicationState.instance.selectedCharacter = ApplicationState.instance.playStructure["characters"][characterKey]["gameObject"]; //characterKey;
			} else {
				ApplicationState.instance.selectedCharacter = null;
			}
			if (__showPopUpCharMenu) __showPopUpCharMenu = false;
		}
		GUILayout.EndHorizontal();
		
	}
	GUILayout.EndVertical();
	
	GUI.EndGroup();
	GUI.EndGroup();
	
	// resize button

	
	if (GUI.RepeatButton(Rect(WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width - __resizeButtonSize, 
							  0, 
							  __resizeButtonSize, 
							  WindowManager.instance.getBottomWindowHeight()), 
						 resizeButtonFront, 
						 resizeButtonStyle)) {
		if ( !__resizingCharacterWindow ) {
			__initialXPosResizing = Input.mousePosition.x;
			__initialWidthResizing = WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width;
			__resizingCharacterWindow = true;
		}
	}

	GUI.Label(Rect(5, 
				   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].height - __lowerButtonSize - 5,
				   100,
				   100),
			  __characterKeysShowing.length + " Characters",
			  characterCountStyle);

	if (GUI.Button(Rect(WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width - 50, 
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].height - __lowerButtonSize - 3, 
						__lowerButtonSize, 
						__lowerButtonSize),
				   addButtonTexture,
				   emptyGUIStyle)) {
		
		// TODO give the user control over the adding character functionality
		// TODO possibly change all the new character handling to another behaviour
		addRandomCharacter();
		
	}
	
	if (GUI.Button(Rect(WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width - 30,
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].height - __lowerButtonSize - 3, 
						__lowerButtonSize, 
						__lowerButtonSize),
				   trashButtonTexture,
				   emptyGUIStyle)) {
		removeSelectedCharacter(3);
	}
	
	// ugly hardcoded menu begins here
	
	var buttonY : float = 27 / 2.0 - 17 / 2.0;
	
	if (GUI.Button(Rect(WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width  - 53, buttonY, 42, 19),
			   			"Options" ) ) {
		
		__showFirstMenu = !__showFirstMenu;
		if (__showPopUpCharMenu) __showPopUpCharMenu = false;
	} 
	
	if (__showFirstMenu) {

		
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID].x = WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].width  - 53;
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID].y = WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_ID].y + buttonY + 19;
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID].width = __menu_1_width;
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID].height = __menu_1_height;
		
		WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID] =
			GUI.Window(WindowManager.instance.CHARACTER_MENU_1_ID,
					   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID],
					   createOptionMenu,
					   GUIContent("", __MENU_1_ONMOUSE), menuStyle);
		
	}
	
}

private function onStageWindowFunction (windowID : int) 
{
	
	__scrollViewVector = GUILayout.BeginScrollView (__scrollViewVector, 
													GUILayout.Width(WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
													GUILayout.Height(WindowManager.instance.getBottomWindowHeight() - 46));
	// create character on stage spaces
	var currentBackgroundStyle : GUIStyle;
	GUILayout.BeginVertical();
	for (var characterKey in __characterKeysShowing) {
		
		
		if (ApplicationState.instance.selectedCharacter != null && 
			characterKey == ApplicationState.instance.selectedCharacter.name) {
			
			currentBackgroundStyle = selectedCharacterRowStyle;		
		} else {
			currentBackgroundStyle = characterRowStyle;
		}
				
		GUILayout.Label("", currentBackgroundStyle);
	}
	GUILayout.EndVertical();
	

	
	
	// draw markers
	
	//drawActionBars();
	drawSpeechActionBars();
	drawPresenceActionBars();
	drawCharacterAnnotations();
	
	GUILayout.EndScrollView ();

	__timeLine.DrawGUI();

	// red marker
		
	var markerPosition : float = ApplicationState.instance.playTime * __breakMainTimeLineInCount / ApplicationState.instance.playTimeLength;
	markerPosition = markerPosition % 1;
	var markerX:float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * markerPosition - 4;

	if (GUI.RepeatButton(Rect(markerX, 1, 8, WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].height - 20), 
		secondTimeLineMarker, secondTimeLineStyle)) {
		if (! __dragging) {
			__initialXPosDragging = Input.mousePosition.x;
			__dragging = true;
		}
	}
	
	
	GUI.Label(Rect(5,
				   WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].height - __lowerButtonSize - 4.45,
				   __lowerButtonSize,
				   __lowerButtonSize),
			  circleTextureSmall);
	GUI.Label(Rect(98,
			   	   WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].height - __lowerButtonSize - 7.80,
			       __lowerButtonSize * 2.0 - 4,
			   	   __lowerButtonSize * 2.0 - 4),
			  circleTextureBig);
	// scale timeline slider
	
	__breakMainTimeLineInCount = GUI.HorizontalSlider(Rect(15, 
														  WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].height - __lowerButtonSize - 3, 
														  80, 
														  __lowerButtonSize - 3),
													  __breakMainTimeLineInCount, 1.0, 30.0);
	
	__scalingFactor = __breakMainTimeLineInCount/7.0;
													
	__timeLine.breakMainTimeLineInCount = __breakMainTimeLineInCount;
	__timeLine.setScalingFactor(__scalingFactor);
	
	// resize button
	if (! WindowManager.instance.windowFloat[WindowManager.instance.ANNOTATIONS_ID] || 
		! WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID]) {
		if (GUI.RepeatButton(Rect(WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize, 
								  0, 
								  __resizeButtonSize, 
								  WindowManager.instance.getBottomWindowHeight()), 
							 resizeButtonFront, 
							 resizeButtonStyle)) {
			if ( !__resizingOnStageWindow ) {
				__initialXPosResizing = Input.mousePosition.x;
				__initialWidthResizing = WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width;
				__resizingOnStageWindow = true;
			}
		}
	}
	
}

public function FinishInitialization()
{
	__timeLine.breakMainTimeLineInCount = __breakMainTimeLineInCount;
	__timeLine.timeLineWidth = WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize;
	__timeLine.FinishInitialization();
	
	__speechActionBars                 = Hashtable();
	__presenceActionBars               = Hashtable();
	__characterActionBars              = Hashtable();
	__characterAnnotationBars          = Hashtable();
	__characterAnnotationIndexes       = Hashtable();
	__characterAnotationBarStyles      = Hashtable();
	__characterAnotationDotStyles      = Hashtable();
	__characterSpeechStyles            = Hashtable();
	__characterPresenceStyles          = Hashtable();
	__characterPresenceOpenStyles      = Hashtable();
	__characterPresenceOpenLeftStyles  = Hashtable();
	__characterPresenceOpenRightStyles = Hashtable();

	__characterKeysShowing = new Array();
	__characterKeysShowingIndexes = new Hashtable();

	//~ for (var characterKey:String in ApplicationState.instance.currentScene["destinations"].Keys) {
	for (var characterKey:String in ApplicationState.instance.playStructure["characters"].Keys) {
		__characterKeysShowing.Push(characterKey);
		__presenceActionBars[characterKey]         = Array();
		__speechActionBars[characterKey]           = Array();	
		__characterActionBars[characterKey]        = Array();
		__characterAnnotationBars[characterKey]    = Array();
		__characterAnnotationIndexes[characterKey] = Array();

	}
	
	// get reversed __characterKeysShowing
	
	for (var k : int = 0 ; k < __characterKeysShowing.length; k++) {
		__characterKeysShowingIndexes[__characterKeysShowing[k]] = k;
	}


	//createSpeechActionBars(ApplicationState.instance.playStructure["characters"].Keys);
	createPresenceActionBars(ApplicationState.instance.playStructure["characters"].Keys);
	//createCharacterAnnotations(ApplicationState.instance.playStructure["characters"].Keys);
	createAnotationStyles(ApplicationState.instance.playStructure["characters"].Keys);
	createSpeechPresenceStyles(ApplicationState.instance.playStructure["characters"].Keys);
	//createActionBars();
	__newCharacterPosition = GameObject.Find("newCharacterPosition");
	
}

private function applyColor(tex : Texture2D, color : Color)
{
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {

			tex.SetPixel(i, j, tex.GetPixel(i,j) * color);
		}
	}
	tex.Apply();
}

function createSpeechPresenceStyles(characterKeys : Array)
{
	var tex : Texture2D;
	
	for (var characterKey in characterKeys) {
		__characterSpeechStyles[characterKey]            = GUIStyle();
		__characterPresenceStyles[characterKey]          = GUIStyle();
		__characterPresenceOpenStyles[characterKey]      = GUIStyle();
		__characterPresenceOpenLeftStyles[characterKey]  = GUIStyle();
		__characterPresenceOpenRightStyles[characterKey] = GUIStyle();

		// speech
		
		tex = Instantiate(speechActionBarTexture);
		applyColor(tex, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);
		
		__characterSpeechStyles[characterKey].border.left   = 3;
		__characterSpeechStyles[characterKey].border.right  = 3;
		__characterSpeechStyles[characterKey].border.top    = 3;
		__characterSpeechStyles[characterKey].border.bottom = 3;
		
		__characterSpeechStyles[characterKey].normal.background = tex;
		
		// presence
		tex = Instantiate(presenceActionBarTexture);
		applyColor(tex, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);

		__characterPresenceStyles[characterKey].border.left   = 3;
		__characterPresenceStyles[characterKey].border.right  = 3;
		__characterPresenceStyles[characterKey].border.top    = 3;
		__characterPresenceStyles[characterKey].border.bottom = 3;

		__characterPresenceStyles[characterKey].normal.background = tex;
		
		
		// presence open
		tex = Instantiate(presenceActionBarOpenTexture);
		applyColor(tex, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);

		__characterPresenceOpenStyles[characterKey].border.left   = 3;
		__characterPresenceOpenStyles[characterKey].border.right  = 3;
		__characterPresenceOpenStyles[characterKey].border.top    = 3;
		__characterPresenceOpenStyles[characterKey].border.bottom = 3;

		__characterPresenceOpenStyles[characterKey].normal.background = tex;
		
		// presence open left
		tex = Instantiate(presenceActionBarOpenLeftTexture);
		applyColor(tex, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);

		__characterPresenceOpenLeftStyles[characterKey].border.left   = 3;
		__characterPresenceOpenLeftStyles[characterKey].border.right  = 3;
		__characterPresenceOpenLeftStyles[characterKey].border.top    = 3;
		__characterPresenceOpenLeftStyles[characterKey].border.bottom = 3;

		__characterPresenceOpenLeftStyles[characterKey].normal.background = tex;
		
		// presence open right
		tex = Instantiate(presenceActionBarOpenRightTexture);
		applyColor(tex, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);

		__characterPresenceOpenRightStyles[characterKey].border.left   = 3;
		__characterPresenceOpenRightStyles[characterKey].border.right  = 3;
		__characterPresenceOpenRightStyles[characterKey].border.top    = 3;
		__characterPresenceOpenRightStyles[characterKey].border.bottom = 3;

		__characterPresenceOpenRightStyles[characterKey].normal.background = tex;
	}
}

function createAnotationStyles(characterKeys : Array)
{
	for (var characterKey in characterKeys) {
		__characterAnotationBarStyles[characterKey] = GUIStyle();
		__characterAnotationDotStyles[characterKey] = GUIStyle();
		
		var barTexture : Texture2D = Instantiate(characterAnotationBarTexture);
		var dotTexture : Texture2D = Instantiate(characterAnotationDotTexture);
		
		applyColor(barTexture, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);
		applyColor(dotTexture, ApplicationState.instance.playStructure["characters"][characterKey]["color"]);
		
		
		__characterAnotationBarStyles[characterKey].border.left   = 6;
		__characterAnotationBarStyles[characterKey].border.right  = 6;
		__characterAnotationBarStyles[characterKey].border.top    = 6;
		__characterAnotationBarStyles[characterKey].border.bottom = 0;
		
		__characterAnotationDotStyles[characterKey].border.left   = 6;
		__characterAnotationDotStyles[characterKey].border.right  = 0;
		__characterAnotationDotStyles[characterKey].border.top    = 6;
		__characterAnotationDotStyles[characterKey].border.bottom = 0;
		

		
		__characterAnotationBarStyles[characterKey].normal.background = barTexture;
		__characterAnotationDotStyles[characterKey].normal.background = dotTexture;
		
				

	}

}

function drawActionBars()
{
	
	
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / __breakMainTimeLineInCount));
	
	
	for (var characterKey in __characterKeysShowing) {		

		GUI.BeginGroup(Rect(showPart * (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
							(__characterKeysShowingIndexes[characterKey] -1)  * characterRowStyle.fixedHeight + __topPadding + 2, 
							workingArea, 
							__topPadding));
							
		for (var currentActionBar : GameObject in __characterActionBars[characterKey])	{
			currentActionBar.GetComponent(ActionBarControl).ForOnGUI();
		}			
				
		GUI.EndGroup();
	}
}


private function drawSpeechActionBars()
{
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / __breakMainTimeLineInCount));
	var currentPosition : float;
	var currentWidth : float;
	var endTime : float;
	
	for (var characterKey in __characterKeysShowing) {
		GUI.BeginGroup(Rect(showPart * (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
							(__characterKeysShowingIndexes[characterKey] -1)  * characterRowStyle.fixedHeight + __topPadding + 2, 
							workingArea, 
							__topPadding));
		
		for (scene in ApplicationState.instance.playStructure["scenes"]) {	
			for (line in scene["lines"]) {
				if (line["character"] == characterKey) {
					
					currentPosition = 1.0 * (line["startTime"] * workingArea / ApplicationState.instance.playTimeLength);
					endTime = line["startTime"] + ApplicationState.getLineTime(line["text"], line["pace"]);

					currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
										
					GUI.Label(Rect(currentPosition * __scalingFactor,
								   0,
								   currentWidth * __scalingFactor,
								   speechActionBarTexture.height), "", __characterSpeechStyles[characterKey]);
				}
			}
		}
		
		GUI.EndGroup();
	}
	
	
	// for (var characterKey in __speechActionBars.Keys) {
	// 
	// 		GUI.BeginGroup(Rect(showPart * (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
	// 							(__characterKeysShowingIndexes[characterKey] -1)  * characterRowStyle.fixedHeight + __topPadding + 2, 
	// 							workingArea, 
	// 							__topPadding));
	// 		
	// 		for (var currentRect : Rect in 	__speechActionBars[characterKey]) {
	// 
	// 			GUI.Label(Rect(currentRect.x * __scalingFactor,
	// 						   currentRect.y,
	// 						   currentRect.width * __scalingFactor,
	// 						   currentRect.height), "", __characterSpeechStyles[characterKey]);	
	// 			
	// 		}
	// 		
	// 		GUI.EndGroup();
	// 		
	// 	}
	
}


// this function is unused because we are generating them on the fly
function createSpeechActionBars(characterKeys : Array) // XXX TODO
{
	
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	
	var currentPosition : float;
	var currentWidth : float;
	var characters : Hashtable = Hashtable();
	
	for (var characterKey in characterKeys) {
		__speechActionBars[characterKey].Clear();
		characters[characterKey] = true;
	}
	
	for (scene in ApplicationState.instance.playStructure["scenes"]) {	
		for (line in scene["lines"]) {
			
			if (characters.Contains(line["character"])) {
			
				currentPosition = 1.0 * (line["startTime"] * workingArea / ApplicationState.instance.playTimeLength);
				var endTime : float = line["startTime"] + ApplicationState.getLineTime(line["text"], line["pace"]);
		
				currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
			
				__speechActionBars[line["character"]].Push( Rect( currentPosition , 0 , currentWidth, speechActionBarTexture.height) );
			}
		}
	}
}

private function drawCharacterAnnotations()
{
	
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / __breakMainTimeLineInCount));
	var currentPosition : float;
	var currentWidth : float;
	var currentGUIStyle : GUIStyle;
	var widthScaling : float = 1;
	var count : int = 0;
	
	var text : Regex = new Regex("\\d.+");

	if (__showAnnotationTooltip && 
		Time.time - __startedCountingAt > ApplicationState.instance.delayForTooltip && 
		!__changedAnnotationState ) {
		
		var separated = ApplicationState.instance.currentToolTip.Split("_"[0]);
		__selectedAnnotation = float.Parse(separated[0]);
		//Debug.Log("selecting " + __selectedAnnotation);
		__annotationsWindowControl.selectAnotationState(__selectedAnnotation);	
		__changedAnnotationState = true;
			
	}

	for (var characterKey in __characterAnnotationBars.Keys) {
		GUI.BeginGroup(Rect(showPart * (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
							(__characterKeysShowingIndexes[characterKey] -1)  * characterRowStyle.fixedHeight + __topPadding + 14, 
							workingArea, 
							__topPadding));
		
		count = 0;
		
		for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
			if (annotation.Contains("character")) {
				if (annotation["character"] == characterKey) {
					
					currentPosition = 1.0 * (annotation["startTime"] * workingArea / ApplicationState.instance.playTimeLength);
					
					// change
					if (annotation.ContainsKey("endTime")) {
						currentGUIStyle = __characterAnotationBarStyles[characterKey];
						currentWidth = 1.0 * (annotation["endTime"] * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
						widthScaling = __scalingFactor;
					} else {
						currentGUIStyle = __characterAnotationDotStyles[characterKey];
						currentWidth = 6; //XXX temp
						widthScaling = 1.0;
					}

					GUI.Label(Rect(currentPosition * __scalingFactor,
								   		0,
								   		currentWidth * widthScaling,
								   		6), GUIContent("", count + "_ANNOTATION-STYLE_" + __annotationsWindowControl.getAnnotation(count)) , currentGUIStyle);
			
					
					if (! __showAnnotationTooltip && ApplicationState.instance.currentToolTip.Contains("ANNOTATION-STYLE")) {
						
						__startedCountingAt = Time.time;
						
						__showAnnotationTooltip = true;
					}
				
					if (__showAnnotationTooltip && !ApplicationState.instance.currentToolTip.Contains("ANNOTATION-STYLE")) {
						__annotationsWindowControl.deselectAnotationState(__selectedAnnotation);
						__showAnnotationTooltip = false;
						__changedAnnotationState = false;
					}
				
					// if (GUI.Button(Rect(currentPosition * __scalingFactor,
					// 						   		0,
					// 						   		currentWidth * widthScaling,
					// 						   		6), "", "" + count + "_ANNOTATION_ONMOUSE", currentGUIStyle)) {
					// 				__annotationsWindowControl.changeAnotationState(count);
					// 			}
				}
			}
			count++;
		}
		
		
		
		GUI.EndGroup();
	}
}
/*
private function createCharacterAnnotations(characterKeys : Array) // XXX TODO
{
	
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	var currentPosition : float;
	var currentWidth : float;
	var characters : Hashtable = Hashtable();
	
	for (characterKey in characterKeys) {
		__characterAnnotationBars[characterKey].Clear();
		__characterAnnotationIndexes[characterKey].Clear();
		characters[characterKey] = true;
	}
	
	var count : int = 0;
	
	for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
	
		if (annotation.Contains("character")) {
			if (characters.Contains(annotation["character"])) {
				currentPosition = 1.0 * (annotation["startTime"] * workingArea / ApplicationState.instance.playTimeLength);

				if (annotation.ContainsKey("endTime")) {
					currentWidth = 1.0 * (annotation["endTime"] * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
				} else {
					currentWidth = 6; //XXX temp
				} 
				__characterAnnotationBars[annotation["character"]].Push( Rect( currentPosition , 0 , currentWidth, 6) );
				__characterAnnotationIndexes[annotation["character"]].Push(count);
			}		 		
		}
		++count;
	}
}
*/
private function drawPresenceActionBars()
{
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / __breakMainTimeLineInCount));
	
	if (__prevPresenceWorkingArea == Mathf.Infinity) {
		__prevPresenceWorkingArea = workingArea;
	}
	
	for (var characterKey in __presenceActionBars.Keys) {
		//Debug.Log(characterKey);
		GUI.BeginGroup(Rect(showPart * (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize), 
							(__characterKeysShowingIndexes[characterKey] -1)  * characterRowStyle.fixedHeight + __topPadding + 2, 
							workingArea, 
							__topPadding));
		
		//for (var currentRect : Rect in 	__presenceActionBars[characterKey]) {
		var currentRect : Rect;
		var currentStyle : GUIStyle;
		var checkFront : boolean;
		var checkBack : boolean;
		
		for (var i:int = 0 ; i < __presenceActionBars[characterKey].length; i++) {
			checkFront = false;
			checkBack = false;
			currentRect = __presenceActionBars[characterKey][i];
			currentStyle = __characterPresenceStyles[characterKey];
		
			if (i >= 1) {
				checkBack = true;
			} 
			
			if (i < __presenceActionBars[characterKey].length -1) {
				checkFront = true;
			} 	
			
			// should presence bar be opened on the left, right or both sides ?
				
			if ( checkFront && checkBack &&
				Mathf.Abs(__presenceActionBars[characterKey][i].x + __presenceActionBars[characterKey][i].width - 
				__presenceActionBars[characterKey][i+1].x)  < Mathf.Epsilon &&
				Mathf.Abs(__presenceActionBars[characterKey][i-1].x + __presenceActionBars[characterKey][i-1].width -
				__presenceActionBars[characterKey][i].x) < Mathf.Epsilon) {

				currentStyle = __characterPresenceOpenStyles[characterKey];
			} else if (	checkFront &&
				 	Mathf.Abs(__presenceActionBars[characterKey][i].x + __presenceActionBars[characterKey][i].width -
					__presenceActionBars[characterKey][i+1].x) < Mathf.Epsilon) {
				currentStyle = __characterPresenceOpenRightStyles[characterKey];
			} else if (	checkBack && 
					Mathf.Abs(__presenceActionBars[characterKey][i-1].x + __presenceActionBars[characterKey][i-1].width -
					__presenceActionBars[characterKey][i].x) < Mathf.Epsilon) {
				currentStyle = __characterPresenceOpenLeftStyles[characterKey];
			}
				
			GUI.Label(Rect(currentRect.x * __scalingFactor * (workingArea / __prevPresenceWorkingArea),
						   currentRect.y,
						   currentRect.width * __scalingFactor * (workingArea / __prevPresenceWorkingArea),
						   currentRect.height), "", currentStyle);	
			
		}
		
		GUI.EndGroup();
		
	}
}



function createPresenceActionBars(characterKeys : Array)
{
	//Debug.Log("creating");
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	
	var currentPosition : float;
	var currentWidth : float;
	var foundStart : boolean = false;
	var foundEnd : boolean = false;
	var startTime : float = 0;
	var endTime : float = 0;
	var lastScene : Hashtable = null;
	var lastDestination : Hashtable = null;
	var destinations : Array;
	
	
	for (var characterKey : String in characterKeys) {
		__presenceActionBars[characterKey].Clear();
	}
	
	for (scene in ApplicationState.instance.playStructure["scenes"]) {	
		lastDestination = null;
		
		for (characterKey in characterKeys) {
			
			destinations = scene["destinations"][characterKey];
			if (destinations) {
				if (destinations.length == 1 ) {
				
					//Debug.Log(characterKey + " " + scene["name"]);
				
					if (destinations[0]["position"] != ApplicationState.instance.DISAPPEAR_POS) {
				
						if (lastScene == null) {
							startTime = 0;
						} else {
							startTime = lastScene["endTime"];
						}		
					
						endTime = scene["endTime"];
					
						
						currentPosition = 1.0 * (startTime * workingArea / ApplicationState.instance.playTimeLength);
	 					currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;

	 					__presenceActionBars[characterKey].Push(Rect(currentPosition, 
	 																0, 
	 																currentWidth, 
	 																presenceActionBarTexture.height));
					
					
					}
				} else {
				
					foundStart = false;
					lastDestination = null;
				
					for (var destination : Hashtable in destinations) {
					
						if (! foundStart) {
							if(destination["position"] != ApplicationState.instance.DISAPPEAR_POS) {
								foundStart = true;
							
								if (lastDestination == null) {
									if (lastScene == null) {
										startTime = 0;
									} else {
										startTime = lastScene["endTime"];
										//Debug.Log(characterKey + " " + scene["name"] + " " + startTime);
									
									}
								} else {
									//if (lastDestination == ApplicationState.instance.DISAPPEAR_POS) {
										//startTime = destination["endTime"];
										//if (lastDestination == ApplicationState.instance.DISAPPEAR_POS) {
										
										//} else {
											//startTime = lastDestination["endTime"];
											startTime = destination["endTime"];
										//}
									//}
								}
								// ugly
								if (destination == destinations[destinations.length-1]) {
									endTime = scene["endTime"];
									currentPosition = 1.0 * (startTime * workingArea / ApplicationState.instance.playTimeLength);
				 					currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;

				 					__presenceActionBars[characterKey].Push(Rect(currentPosition, 
				 																0, 
				 																currentWidth, 
				 																presenceActionBarTexture.height));
								}
							
							} 
						} else { // found start is true
						
							if(destination["position"] == ApplicationState.instance.DISAPPEAR_POS ||
							   destination["endTime"] == scene["endTime"] 						  ||
							   destination == destinations[destinations.length - 1]) {
							
								foundStart = false;
							
								if (destination["position"] == ApplicationState.instance.DISAPPEAR_POS) {
									endTime = lastDestination["endTime"];
								} else {
									endTime = scene["endTime"];
								}
							
								currentPosition = 1.0 * (startTime * workingArea / ApplicationState.instance.playTimeLength);
			 					currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;

			 					__presenceActionBars[characterKey].Push(Rect(currentPosition, 
			 																0, 
			 																currentWidth, 
			 																presenceActionBarTexture.height));
							}
						
						}
					
						lastDestination = destination;
					
					}
				} // end of else
			}
			
		}
		lastScene = scene;
	}
	
	
	// for (var key : String in __presenceActionBars.Keys) {
	// 		Debug.Log(key + " " + __presenceActionBars[key].length);
	// }
	

}


/*
function createActionBars()
{
	//testActionBar =  Instantiate(Resources.Load( "Prefabs/GUI/ActionBarPrefab" )) as GameObject;
	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
	
	var currentActionBar : GameObject;
	var actionBarControl : ActionBarControl;
	var characterKey;
	var lastDestinationTime : float = 0;
	var newRect : Rect = Rect(0,0,0,0);
	
	var actionBarsParent : GameObject = GameObject.Find("ActionBars");
	
	for (var characterKey in __characterKeysShowing) {
		for (var scene in ApplicationState.instance.playStructure["scenes"]) {	
		
			lastDestinationTime = 0;
			newRect = Rect(0,0,0,0);
			
			if (scene["destinations"][characterKey].length > 1) {

				currentActionBar = Instantiate(Resources.Load( "Prefabs/GUI/ActionBarPrefab" )) as GameObject;
				currentActionBar.transform.parent = actionBarsParent.transform;
				
				actionBarControl = currentActionBar.GetComponent(ActionBarControl);
				
				actionBarControl.setColor( ApplicationState.instance.playStructure["characters"][characterKey]["color"] );
			
				// set y
				//actionBarControl.getRect().y = 2;
				newRect.y = 2;
		
				// set x
				newRect.x =  scene["destinations"][characterKey][0]["endTime"] * 
												   workingArea / 
												   ApplicationState.instance.playTimeLength;
		
		
				// set width 
				var destinationCount = 0;
				
				for (destination in scene["destinations"][characterKey]) {
					if (lastDestinationTime < destination["endTime"]) {
						lastDestinationTime = destination["endTime"];
						
						newRect.width = lastDestinationTime * workingArea / 
														      ApplicationState.instance.playTimeLength;
														
						newRect.width -= newRect.x;
					}
					
				
				
					destinationCount++;
				}
				


				newRect.height = 20;
				
				actionBarControl.initRect(newRect);
				
				__characterActionBars[characterKey].Push(currentActionBar);
				
				  actionBarControl.actionLocation.Push(actionBarControl.getRect().x + actionBarControl.getRect().width / 2);

			
			}
		}
	}
	
}
*/

// function modifyCharacterActionBarsFromWidth(oldWorkingArea : float)
// {
// 	var workingArea : float = (WindowManager.instance.windowRects[WindowManager.instance.ONSTAGE_ID].width - __resizeButtonSize) * __breakMainTimeLineInCount;
// 	var currentRect : Rect;
// 	
// 	for (var characterKey in __characterKeysShowing) {		
// 							
// 		for (var currentActionBar : GameObject in __characterActionBars[characterKey])	{
// 			currentRect = currentActionBar.GetComponent(ActionBarControl).getRect();
// 			currentRect.x = (1.0*currentRect.x / oldWorkingArea)  * workingArea;
// 			currentRect.width = (1.0*currentRect.width / oldWorkingArea)  * workingArea;
// 			currentActionBar.GetComponent(ActionBarControl).setRect(currentRect);
// 		}			
// 				
// 	}
// 
// }

private function addRandomCharacter()
{
	var characterCount : int = 0;
	
	for (keys in ApplicationState.instance.playStructure["characters"].Keys) {
		++characterCount;
	}
		
	var key : String = "Character" + characterCount.ToString();	
	var name : String =  "Character " + characterCount.ToString();
	
	
	ApplicationState.instance.playStructure["characters"][key] = Hashtable();
	
	var newColor : Color = Color(Random.value, Random.value, Random.value);
	
	ApplicationState.instance.playStructure["characters"][key]["color"] = newColor;
	ApplicationState.instance.playStructure["characters"][key]["name"] = name; 
	ApplicationState.instance.playStructure["characters"][key]["model"] = "PersonBigPrefab" ;
	ApplicationState.instance.playStructure["characters"][key]["drawPath"] = true;
	ApplicationState.instance.playStructure["characters"][key]["mug"] = ApplicationState.instance.getColoredMug(newColor);
	ApplicationState.instance.playStructure["characters"][key]["hasLines"] = false;
	ApplicationState.instance.playStructure["characters"][key]["currentLines"] = Array();
	ApplicationState.instance.playStructure["characters"][key]["currentDestination"] = Vector3.zero;
	ApplicationState.instance.playStructure["characters"][key]["speechBubble"] = ApplicationState.instance.getColoredSpeechBubble(newColor);
	ApplicationState.instance.playStructure["characters"][key]["characterControls"] = ApplicationState.instance.getColoredCharacterControlsBackground(newColor);
	
	ApplicationState.instance.playStructure["characters"][key]["gameObject"] = Instantiate(Resources.Load( "Prefabs/Characters/" + 
																										  ApplicationState.instance.playStructure["characters"][key]["model"] ),
									 						  							   __newCharacterPosition.transform.position,
									 						  							   Quaternion.identity) as GameObject;									 		
	ApplicationState.instance.playStructure["characters"][key]["gameObject"].tag = "Character";
	ApplicationState.instance.playStructure["characters"][key]["gameObject"].name = key;
	ApplicationState.instance.playStructure["characters"][key]["gameObject"].GetComponent(CharacterModelColor).setBodyColor( newColor );
	
	// add to blocker list of colliders to be able to move them
	// __blockerComponent.addToColliders(ApplicationState.instance.playStructure["characters"][key]["gameObject"].GetComponent("CharacterController"));
	__blockerComponent.addToCharacterColliders(ApplicationState.instance.playStructure["characters"][key]["gameObject"].GetComponent("CharacterController"));
	// set destinations
	
	var newDestination : Hashtable;
		
	for (var scene : Hashtable in  ApplicationState.instance.playStructure["scenes"]) {
		
		newDestination = Hashtable();
		newDestination["endTime"] = scene["endTime"];
		newDestination["position"] = __newCharacterPosition.transform.position;//Vector3.zero; // newPosition
		
		scene["destinations"][key] = Array();
		scene["destinations"][key].push(newDestination);
	}
	__characterKeysShowing.Push(key);
	__characterActionBars[key] = Array();	
	__characterKeysShowingIndexes[key] = __characterKeysShowing.length - 1;
	
	// create action bars
	
	// __characterGUIContents[key] = new GUIContent();
	// __characterGUIContents[key].text = ApplicationState.instance.playStructure["characters"][key]["name"];
	// __characterGUIContents[key].image =  ApplicationState.instance.playStructure["characters"][key]["mug"];
	

	
}

// removes the character from 1: scene, 2: act, 3: play
private function removeSelectedCharacter(removalDegree:int)
{
	if (ApplicationState.instance.selectedCharacter == null) {
		return;
	}
	
	var sceneTime:float;
	var i:int;
	switch (removalDegree) {
		case 1:
			for (i = 0; i < ApplicationState.instance.playStructure["scenes"].length; i++) {
				if (ApplicationState.instance.playStructure["scenes"][i] == ApplicationState.instance.currentScene) {
					break;
				}
			}
			if (i == 0) sceneTime = 0;
			else sceneTime = ApplicationState.instance.playStructure["scenes"][i-1]["endTime"];
			__blockerComponent.addDestinationCurrentCharacter(ApplicationState.instance.DISAPPEAR_POS, sceneTime, true, false);
			break;
		case 2:
			for (i in ApplicationState.instance.currentAct["scenes"]) {
				if (i == 0) sceneTime = 0;
				else sceneTime = ApplicationState.instance.playStructure["scenes"][i-1]["endTime"];
				__blockerComponent.addDestinationCurrentCharacter(ApplicationState.instance.DISAPPEAR_POS, sceneTime, true, false);
			}
			break;
		case 3:
			var key:String = ApplicationState.instance.selectedCharacter.name;
			Destroy(ApplicationState.instance.playStructure["characters"][key]["gameObject"]);
			ApplicationState.instance.playStructure["characters"].Remove(key);
			
			var scene:Hashtable;
			for (scene in ApplicationState.instance.playStructure["scenes"]) {
				scene["destinations"][key] = null;
				scene["destinations"].Remove(key);
				
				for (i=0; i < scene["lines"].length; i++) {
					if (scene["lines"][i]["character"] == key) {
						scene["lines"].RemoveAt(i--);
					}
				}
			}
			
			for (i = 0; i < __characterKeysShowing.length; i++) {
				if (key == __characterKeysShowing[i]) {
					break;
				}
			}
			__characterKeysShowing.RemoveAt(i);
			
			var removedCharacterIndex : int = __characterKeysShowingIndexes[key];

			//__characterGUIContents[key] = null;
			__characterActionBars[key] = null;
			
			//__characterGUIContents.Remove(key);
			__characterKeysShowingIndexes.Remove(key);
			__characterActionBars.Remove(key);
			__presenceActionBars.Remove(key);
			__characterAnnotationBars.Remove(key);
			
			__timeLine.removeCharacter(key);
			__mainTimeLine.removeCharacter(key);
			
			var toModify : Array = Array();
			
			for (var currentKey : String in __characterKeysShowingIndexes.Keys) {
				if (__characterKeysShowingIndexes[currentKey] > removedCharacterIndex) {
					toModify.push(currentKey);
					//__characterKeysShowingIndexes[currentKey] = __characterKeysShowingIndexes[currentKey] - 1;
					
				}
			}
			
			for (currentKey in toModify) {
				__characterKeysShowingIndexes[currentKey] = __characterKeysShowingIndexes[currentKey] - 1;
			}
			toModify = null;
			
			ApplicationState.instance.speechChanged = true;
	}
	ApplicationState.instance.selectedCharacter = null;
	
	// get rid of paths
	
	ApplicationState.instance.redrawSurfacePaths = true;
	
	
	
}

private function createOptionMenu(windowId : int)
{

	var yPos : float = 5;
	var yStep : float = 20;
	var typeYpos : float;
	var colourYpos : float;
	var nameYpos : float;
	var removeYpos : float;
	
	GUI.Label(Rect(5,yPos,__menu_1_width,20), GUIContent("Type", __TYPE_ONMOUSE));
	GUI.Label(Rect(__menu_1_width - 20,yPos + 2,20,20), menuRightArrowTexture);
	typeYpos = yPos;
	yPos += yStep;
	
	GUI.Label(Rect(5,yPos,__menu_1_width,20), GUIContent("Colour", __COLOUR_ONMOUSE));
	GUI.Label(Rect(__menu_1_width - 20,yPos + 2,20,20), menuRightArrowTexture);
	colourYpos = yPos;
	yPos += yStep;
	
	GUI.Label(Rect(5,yPos,__menu_1_width,20), GUIContent("Name", __NAME_ONMOUSE));
	GUI.Label(Rect(__menu_1_width - 20,yPos + 2,20,20), menuRightArrowTexture);
	nameYpos = yPos;
	yPos += yStep;
	
	GUI.Label(Rect(5,yPos,__menu_1_width,20), GUIContent("Remove", __REMOVE_ONMOUSE));
	GUI.Label(Rect(__menu_1_width - 20,yPos + 2,20,20), menuRightArrowTexture);
	removeYpos = yPos;

	yPos = 0;
	var currentMenu2WindowFunction;
	var currentMenuTooltip : String = __lastToolTip;
	

	if (Event.current.type == EventType.repaint) {
		if (ApplicationState.instance.currentToolTip == __MENU_1_ONMOUSE) {
			__menu_1_onmouse = true;
		}
	
	
		if (ApplicationState.instance.currentToolTip == __TYPE_ONMOUSE) {
			currentMenu2WindowFunction = createTypeMenu;
			__menu_2_onmouse = true;
			currentMenuTooltip = __TYPE_ONMOUSE;
			__lastToolTip = currentMenuTooltip;
			yPos = typeYpos;
		}
		if (ApplicationState.instance.currentToolTip == __COLOUR_ONMOUSE) {
			currentMenu2WindowFunction = createColourMenu;
			__menu_2_onmouse = true;
			currentMenuTooltip = __COLOUR_ONMOUSE;
			__lastToolTip = currentMenuTooltip;
			yPos = colourYpos;
		}
		if (ApplicationState.instance.currentToolTip == __NAME_ONMOUSE) {
			currentMenu2WindowFunction = createNameMenu;
			__menu_2_onmouse = true;
			currentMenuTooltip = __NAME_ONMOUSE;
			__lastToolTip = currentMenuTooltip;
			yPos = nameYpos;
		}
		if (ApplicationState.instance.currentToolTip == __REMOVE_ONMOUSE) {
			currentMenu2WindowFunction = createRemoveMenu;
			__menu_2_onmouse = true;
			currentMenuTooltip = __REMOVE_ONMOUSE;
			__lastToolTip = currentMenuTooltip;
			yPos = removeYpos;
		}
	
		
		
	
		// if (__menu_1_onmouse && 
		// 		GUI.tooltip != __MENU_1_ONMOUSE &&
		// 		GUI.tooltip != __TYPE_ONMOUSE &&
		// 		GUI.tooltip != __COLOUR_ONMOUSE &&
		// 		GUI.tooltip != __NAME_ONMOUSE &&
		// 		! Input.GetMouseButton(0) &&
		// 		! Input.GetMouseButtonUp(0) &&
		// 		! Input.GetMouseButtonDown(0)  ) {
		// 		
		// 		__showFirstMenu = false;
		// 		__menu_1_onmouse = false;
		// 		__menu_2_onmouse = false;
		// 		__startChangingColor = true;
		// 		__lastToolTip = "";
		// 	}
	
		if (__menu_1_onmouse && 
			ApplicationState.instance.currentToolTip != __MENU_1_ONMOUSE &&
			ApplicationState.instance.currentToolTip != __TYPE_ONMOUSE &&
			ApplicationState.instance.currentToolTip != __COLOUR_ONMOUSE &&
			ApplicationState.instance.currentToolTip != __NAME_ONMOUSE &&
			ApplicationState.instance.currentToolTip != __REMOVE_ONMOUSE &&
			! WindowManager.isWindowClicked(Input.mousePosition, WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID]) ) {

			__showFirstMenu = false;
			__menu_1_onmouse = false;
			__menu_2_onmouse = false;
			__startChangingColor = true;
			__lastToolTip = "";
			
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] = Rect(0,0,0,0);
		}
	
	}	
		
				
	//}
	
		if (__menu_2_onmouse) {
			 
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
						WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID];
			WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].x += 
				WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_1_ID].width ;
			
			
			
			
			//Debug.Log(currentMenuTooltip + " <<<");
			
			
			switch (currentMenuTooltip) {
			
				case __TYPE_ONMOUSE:
					//WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].y += ;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].width = 80;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].height = 100;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
						GUI.Window(WindowManager.instance.CHARACTER_MENU_2_ID,
								   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID],
								   createTypeMenu,
								   GUIContent("", currentMenuTooltip), menuStyle);
				break;
			
				case __COLOUR_ONMOUSE:
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].y += 25;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].width = 170;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].height = 70;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
						GUI.Window(WindowManager.instance.CHARACTER_MENU_2_ID,
								   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID],
								   createColourMenu,
								   GUIContent("", currentMenuTooltip), menuStyle);
				
				break;
				
				
				case __NAME_ONMOUSE:
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].width = __menu_name_width;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].height = 35;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].y += 50;

					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
						GUI.Window(WindowManager.instance.CHARACTER_MENU_2_ID,
								   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID],
								   createNameMenu,
								   GUIContent("", currentMenuTooltip), menuStyle);
				break;
				
				case __REMOVE_ONMOUSE:
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].width = 100;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].height = 70;
					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID].y += 75;

					WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID] =
						GUI.Window(WindowManager.instance.CHARACTER_MENU_2_ID,
								   WindowManager.instance.windowRects[WindowManager.instance.CHARACTER_MENU_2_ID],
								   createRemoveMenu,
								   GUIContent("", currentMenuTooltip), menuStyle);
				break;
			}
			
			//UpdateToolTip(); // two
		}

		
	UpdateToolTip(); // one
	
		
	
}

private function changeSelectedToModel(newModel : String)
{
	
	if (ApplicationState.instance.selectedCharacter != null &&
		ApplicationState.instance.selectedCharacter.tag != "CharacterCam" ) {
		
		
		var oldPos : Transform = ApplicationState.instance.selectedCharacter.transform;
		var newBody : GameObject = Instantiate(Resources.Load( "Prefabs/Characters/" + newModel ),
		 								       Vector3(-1000000, -1000000, -1000000),
		 							 		   Quaternion.identity) as GameObject;
		
		newBody.tag = ApplicationState.instance.selectedCharacter.tag;
		newBody.name = ApplicationState.instance.selectedCharacter.name;
		ApplicationState.instance.playStructure["characters"][newBody.name]["model"] = newModel;
		
		newBody.GetComponent(CharacterModelColor).setBodyColor( ApplicationState.instance.playStructure["characters"][newBody.name]["color"] );
		
		Destroy(ApplicationState.instance.playStructure["characters"][newBody.name]["gameObject"] );
		ApplicationState.instance.playStructure["characters"][newBody.name]["gameObject"] = newBody;
		ApplicationState.instance.selectedCharacter = ApplicationState.instance.playStructure["characters"][newBody.name]["gameObject"];
		
		newBody.transform.position = oldPos.position;
		newBody.transform.rotation = oldPos.rotation;
		
	
	}
	
	
}

private function createTypeMenu(windowId : int)
{
	GUI.BeginGroup(Rect(5, 5, 100, 140));
	GUILayout.BeginVertical();
	if (GUILayout.Button("Adult", menuButtonStyle )) {
		changeSelectedToModel("PersonBigPrefab");
	}
	if (GUILayout.Button("Child", menuButtonStyle ) ) {
		changeSelectedToModel("PersonMediumPrefab");
	}
	if (GUILayout.Button("Baby", menuButtonStyle ) ) {
		changeSelectedToModel("PersonSmallPrefab");
	}
	if (GUILayout.Button("Big animal", menuButtonStyle ) ) {
		changeSelectedToModel("AnimalBigPrefab");		
	}
	if (GUILayout.Button("Small animal", menuButtonStyle ) ) {
		changeSelectedToModel("AnimalSmallPrefab");
	}
	if (GUILayout.Button("Tree", menuButtonStyle ) ) {
		changeSelectedToModel("TreePrefab");
	}
	
	GUILayout.EndVertical();
	GUI.EndGroup();
}


private function createColourMenu(windowId : int)
{
	
	var yPos : float = 5;
	var yStep : float = 20;
	
	//var currentColor : Color = __currentColor;
	var key : String = "";
	
	
	if (ApplicationState.instance.selectedCharacter == null ||
		ApplicationState.instance.selectedCharacter.CompareTag("CharacterCam")) {
			__currentColor = Color(0.5,0.5,0.5);
	} else {
		key = ApplicationState.instance.selectedCharacter.name;
	}
	
	if (__startChangingColor && 
		ApplicationState.instance.selectedCharacter != null &&
		! ApplicationState.instance.selectedCharacter.CompareTag("CharacterCam")) {
			__currentColor = ApplicationState.instance.playStructure["characters"][key]["color"];
			__startChangingColor = false;
	}
	
	GUI.Label(Rect(5,yPos,20,20), "R:");
	__currentColor.r = GUI.HorizontalSlider(Rect(30,yPos + 5,80,20), __currentColor.r, 0.0, 1.0);
	yPos += yStep;
	
	GUI.Label(Rect(5,yPos,20,20), "G:");
	__currentColor.g = GUI.HorizontalSlider(Rect(30,yPos + 5,80,20), __currentColor.g, 0.0, 1.0);
	yPos += yStep;
	
	GUI.Label(Rect(5,yPos,20,20), "B:");
	__currentColor.b = GUI.HorizontalSlider(Rect(30,yPos + 5,80,20), __currentColor.b, 0.0, 1.0);
	//yPos += yStep;
	
	if (__lastColor != __currentColor) {
		__lastColor = __currentColor;
		for (var i : int = 0 ; i < colorChangePreviewTexture.width; i++) {
			for (var j : int = 0 ; j < colorChangePreviewTexture.height; j++) {
		
				colorChangePreviewTexture.SetPixel(i, j, __currentColor);
			}
		}
		colorChangePreviewTexture.Apply();
	}
	
	GUI.Label(Rect(115,5,colorChangePreviewTexture.width,colorChangePreviewTexture.height), colorChangePreviewTexture);
	if ( GUI.Button(Rect(115,40,32,25), "OK") ) {
		__startChangingColor = true;
		
		if (ApplicationState.instance.selectedCharacter != null &&
			ApplicationState.instance.selectedCharacter.tag != "CharacterCam" ) {
			
			ApplicationState.instance.playStructure["characters"][key]["color"] = __currentColor;
			ApplicationState.instance.selectedCharacter.GetComponent(CharacterModelColor).setBodyColor( __currentColor );
			ApplicationState.instance.playStructure["characters"][key]["speechBubble"] = ApplicationState.instance.getColoredSpeechBubble(__currentColor);
			ApplicationState.instance.playStructure["characters"][key]["characterControls"] = ApplicationState.instance.getColoredCharacterControlsBackground(__currentColor);
			
			ApplicationState.instance.redrawSurfacePaths = true;
			ApplicationState.instance.playStructure["characters"][key]["mug"] = ApplicationState.instance.getColoredMug(__currentColor);
			
			for (i = 1 ; i < colorChangePreviewTexture.width - 1; i++) {
				for ( j = 1 ; j < colorChangePreviewTexture.height - 1; j++) {

					colorChangePreviewTexture.SetPixel(i, j, __currentColor);
				}
			}
			colorChangePreviewTexture.Apply();
	
			createAnotationStyles(Array(key));
			createSpeechPresenceStyles(Array(key));
			__annotationsWindowControl.createHeaderTextures(Array(key));
		}
		
	}
	
	
	
}


private function createNameMenu(windowId : int)
{
	
	var textFieldRect : Rect = Rect(5,5, __menu_name_width - 10, 25);
	
	if (ApplicationState.instance.selectedCharacter != null &&
		ApplicationState.instance.selectedCharacter.tag != "CharacterCam" ) {
			var key : String = ApplicationState.instance.selectedCharacter.name;
			ApplicationState.instance.playStructure["characters"][key]["name"] = 
				GUI.TextField(textFieldRect, ApplicationState.instance.playStructure["characters"][key]["name"]);
	} else {
			GUI.TextField(textFieldRect, "");
	}	
}

public function showCharacterMenu(menuPos:Vector2) {
	__popUpCharMenuPos = menuPos;
	__showPopUpCharMenu = true;
}

private function createRemoveMenu(windowId : int)
{
	GUI.BeginGroup(Rect(5, 5, 100, 70));
	GUILayout.BeginVertical();
	GUILayout.Label("Remove From:", menuButtonStyle);
	if (GUILayout.Button("Current Scene", menuButtonStyle )) {
		removeSelectedCharacter(1);
		if (__showPopUpCharMenu) __showPopUpCharMenu = false;
	}
	if (GUILayout.Button("Current Act", menuButtonStyle ) ) {
		removeSelectedCharacter(2);
		if (__showPopUpCharMenu) __showPopUpCharMenu = false;
	}
	if (GUILayout.Button("Entire Play", menuButtonStyle ) ) {
		if (ApplicationState.instance.selectedCharacter != null) {
			ApplicationState.instance.showConfirm("Confirmation", "Do you really want to remove "+ApplicationState.instance.selectedCharacter.name+"? (This cannot be undone).", doRemove);
		}
		if (__showPopUpCharMenu) __showPopUpCharMenu = false;
	}
	GUILayout.EndVertical();
	GUI.EndGroup();
}

private function doRemove(reallyDo:int) {
	if (reallyDo == 1) removeSelectedCharacter(3);
}


}