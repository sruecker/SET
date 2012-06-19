
import ApplicationState;
import WindowManager;

public var gSkin : GUISkin;
public var emptyGuiSkin : GUISkin;
public var timeLineStyle : GUIStyle;
public var timeLinePatchStyle : GUIStyle;

public var textSkin : GUIStyle;
public var ridgeStyle : GUIStyle;
public var windowBackgroundStyle : GUIStyle;

public var playTexture : Texture2D;
public var pauseTexture : Texture2D;
public var startTexture : Texture2D;
public var endTexture : Texture2D;
public var fastForwardTexture : Texture2D;
public var fastBackwardTexture : Texture2D;
public var resizeGUIButtonTexture : Texture2D;
public var resizeGUIButtonStyle : GUIStyle;

public var timeLineLightingStyle : GUIStyle;

//public var ridgeTexture : Texture2D;

private var CONTROL_BUTTON_SIZE : int  = 35;

private	var __ridgeHeight : int = 38;
private	var __ridgeWidth : int = 6;
private var __lowerPadding : int = 12;

private var __timeLine : TimeLine;
private var __timeLineLeftPadding : int;
private var __timeLineTopPadding : int;

private var __scrubber : Scrubber;

private var __leftLightingRect : Rect;
private var __rightLightingRect : Rect;
private var __skipScrubber : boolean;
private var __resizeGUI : boolean;
private var __initialResizeHeight : float;

private var __resetBottom: boolean = false;
private var __resetHeight : int = 200;

function Awake()
{
	__timeLineTopPadding = 10;
	__timeLineLeftPadding = 50;
	__timeLine = GetComponent(TimeLine);
	__scrubber = GetComponent(Scrubber);
	__skipScrubber = false;
	__resizeGUI = false;

}

function Start () {
	setScrubberPositions();
}


function setScrubberPositions()
{
	var yPos = WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].y + __timeLineTopPadding - 5;
	__scrubber.scrubberRect.y = yPos;
	__scrubber.maxXDrag = Screen.width - __scrubber.scrubberRect.width / 2 - 1; // XXX FIXME HACK -1 is to stop several errors
	__scrubber.minXDrag = __timeLineLeftPadding - __scrubber.scrubberRect.width / 2;
	
	//__leftLightingRect = Rect(__timeLineLeftPadding, yPos + 5, 0, 28);
	__leftLightingRect = Rect(0, yPos + 5, 0, 28);
	__rightLightingRect = Rect(__timeLineLeftPadding + __scrubber.scrubberRect.x + __scrubber.scrubberRect.width / 2.0, yPos + 5, Screen.width, 28);
}

function FinishInitialization()
{
	__timeLine.timeLineWidth = WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width - __timeLineLeftPadding;
	__timeLine.FinishInitialization();
	__scrubber.SetToPlayTime();

}

function resetBottomWindow(height : int){
	__resetHeight = height;
	__resetBottom = true;
}

function OnGUI () 
{

	GUI.skin = gSkin;
	
	GUI.BeginGroup(WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID]);
	windowFunction(WindowManager.instance.TIMELINE_ID);
	GUI.EndGroup();
	
	// left lighting	
	
	//var newLeftLightingWidth : int = __scrubber.scrubberRect.x - __timeLineLeftPadding;
	var newLeftLightingWidth : int = __scrubber.scrubberRect.x;

	
	if (Mathf.Sign(newLeftLightingWidth) == 1) { 
		__leftLightingRect.width = newLeftLightingWidth;
	} else {
		__leftLightingRect.width = 0;	
	}
	
	__rightLightingRect.x = __scrubber.scrubberRect.x + __scrubber.scrubberRect.width;
	
	if (GUI.Button( __leftLightingRect, "", timeLineLightingStyle)) {
		__skipScrubber = true;
	}
	
	if ( GUI.RepeatButton(Rect(0, 
						   	   WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].y + 2,
						   	   Screen.width,
							   resizeGUIButtonTexture.height ), resizeGUIButtonTexture, resizeGUIButtonStyle) ) {
		if (! __resizeGUI) {
			__resizeGUI = true;
			
			if (WindowManager.instance.getBottomWindowHeight() > 100) {
				__initialResizeHeight = Input.mousePosition.y - WindowManager.instance.getBottomWindowHeight();
			} 
			else {
				__initialResizeHeight = Input.mousePosition.y;
			}

		}
	}
	
	if (__resizeGUI) {
		if (!Input.GetMouseButton(0)) {
			__resizeGUI = false;	
		} else {
			resetBottomWindow(Input.mousePosition.y - __initialResizeHeight);			
			// __resetHeight = Input.mousePosition.y - __initialResizeHeight;
			// __resetBottom = true;
		}
	}
	
	
	if (__resetBottom) {
		__resetBottom = false;
		WindowManager.instance.setBottomWindowHeight(__resetHeight);
		setScrubberPositions();	
		
	}
	
	
	__scrubber.DrawGUI();

	//right lighting
	if (GUI.Button( __rightLightingRect, "", timeLineLightingStyle)) {
		__skipScrubber = true;
	}
		
	if (__skipScrubber) {
		__skipScrubber = false;
		var ratio : float = (Input.mousePosition.x - __timeLineLeftPadding) / 
							(Screen.width - __timeLineLeftPadding);
		var newPlaytime : float = ratio * ApplicationState.instance.playTimeLength;
		if (newPlaytime < 0) {
			newPlaytime = 0;
		}
		ApplicationState.instance.playTime = newPlaytime;
	}
	

					   
	// GUI.Label(Rect(0, 
	// 			   Screen.height - WindowManager.instance.getBottomWindowHeight(),
	// 			   Screen.width, 
	// 			   WindowManager.instance.getBottomWindowHeight()),
	// 		  "", 
	// 		  windowBackgroundStyle);								   
	// 

			
}

function windowFunction(windowId : int)
{

	// create background
	GUI.Label(Rect(0,
				   0, 
				   WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width,
				   WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].height), 
			  "", 
			  timeLineStyle);

	// add slider 
	createSpeedSlider();
	
	// add buttons
	createControlButtons();
	
	// add ridges
	
	createRidges();
	
	// add right side controls
	
	createRightSideControls();

	// add time line patch to fill left side of the window
	
	GUI.Label(Rect(0,
				   __timeLineTopPadding,
				   __timeLineLeftPadding,
				   28),
			  "",
			  timeLinePatchStyle);
	
	// add timeline
	
	GUI.BeginGroup(Rect(__timeLineLeftPadding, 
					__timeLineTopPadding,
					__timeLine.timeLineWidth,
					30));
	__timeLine.timeLineWidth = WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width - __timeLineLeftPadding;
	__timeLine.DrawGUI();

	GUI.EndGroup();
	//GUI.DragWindow();
	
		// add slider
	
}




private function createControlButtons()
{
	
	var positionStep : int = 0;
	var buttonsArea : int = CONTROL_BUTTON_SIZE * 5; 

	GUI.skin = emptyGuiSkin;

	GUI.BeginGroup( Rect(WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width / 2.0 - buttonsArea / 2.0 , 
						 WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].height - CONTROL_BUTTON_SIZE - __lowerPadding, 
						 buttonsArea, 
						CONTROL_BUTTON_SIZE));



	// start
	
	if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), startTexture) ) {
		ApplicationState.instance.playTime = 0;
		ApplicationState.instance.playTimeUpdated = true;
	}
	
	positionStep += CONTROL_BUTTON_SIZE;
	
	// fb
	if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), fastBackwardTexture) ) {
		skipScenes(-1);
		ApplicationState.instance.playTimeUpdated = true;
	}
	
	positionStep += CONTROL_BUTTON_SIZE;
	
	// play
	
	if ( ApplicationState.instance.animate ) {
		if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), pauseTexture) ) {
			ApplicationState.instance.animate = !ApplicationState.instance.animate;
		}
	} else {
		if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), playTexture) ) {
			ApplicationState.instance.animate = !ApplicationState.instance.animate;
		}
	}
	
	 
	
	positionStep += CONTROL_BUTTON_SIZE;
	
	// ff
	if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), fastForwardTexture) ) {
		skipScenes(1);
		ApplicationState.instance.playTimeUpdated = true;
	}
	
	positionStep += CONTROL_BUTTON_SIZE;
	
	// end
	if ( GUI.Button( Rect( positionStep, 0, CONTROL_BUTTON_SIZE, CONTROL_BUTTON_SIZE), endTexture) ) {
		ApplicationState.instance.playTime = ApplicationState.instance.playTimeLength - 0.01;
		ApplicationState.instance.playTimeUpdated = true;
	}
	
	positionStep += CONTROL_BUTTON_SIZE;

	GUI.EndGroup();
	
	
}

private function createSpeedSlider()
{
	
	
	if (ApplicationState.instance.playSpeed >= 0.95 && ApplicationState.instance.playSpeed <= 1.05) {
		ApplicationState.instance.playSpeed = 1;
	}
	
	
	

	var speedString = ApplicationState.instance.playSpeed.ToString("0.00") + "x";
	//speedString.Format("{0:N3}"); 
	// speedString = String.Format("{0:#.##}x", speedString);
	
	
	
	var speedStringPosition : int = (ApplicationState.instance.playSpeed / 2.0) * 100 + 50 - 5;
	
	GUI.BeginGroup( Rect((WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width / 3) * .5 - 75, 
						 WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].height - CONTROL_BUTTON_SIZE, 
						 200, 
						 CONTROL_BUTTON_SIZE ) );
	
	ApplicationState.instance.playSpeed = GUI.HorizontalSlider( Rect(50, 2, 100, 30 ), ApplicationState.instance.playSpeed, 0.0, 2.0) ;

	GUI.Label(Rect(50, 15, 100, 30 ), "Speed", textSkin); 
	GUI.Label(Rect(120, 15, 100, 30 ), speedString, textSkin);

	GUI.EndGroup();
	
}

private function createRightSideControls()
{

	
	GUI.BeginGroup( Rect(2.0 * (Screen.width / 3) + (Screen.width / 3) * 0.5 - 25, 
						 WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].height - CONTROL_BUTTON_SIZE - 6, 
						 50, 
						 CONTROL_BUTTON_SIZE / 2.0 ) );
						

	
	GUI.EndGroup();
}

private function createRidges()
{
	
	var buttonsArea : int = CONTROL_BUTTON_SIZE * 6; 

	
	GUI.BeginGroup( Rect(WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].width / 2.0 - buttonsArea / 2.0  + 5, 
					 WindowManager.instance.windowRects[WindowManager.instance.TIMELINE_ID].height - CONTROL_BUTTON_SIZE - __lowerPadding, 
					 buttonsArea, 
					CONTROL_BUTTON_SIZE + 10));
	
	GUI.Label(Rect(0, 
			   0, 
			   __ridgeWidth, 
			   __ridgeHeight),
		      "",
			  ridgeStyle);
			
	GUI.Label(Rect(buttonsArea - __ridgeWidth * 2 - __ridgeWidth / 2, 
		   0, 
		   __ridgeWidth, 
		   __ridgeHeight),
	      "",
		  ridgeStyle);
	
	GUI.EndGroup();
	
}

private function skipScenes( direction : int ) 
{
	
	var newTime : float = ApplicationState.instance.playTime;
	var sceneIndex : int = ApplicationState.instance.getSceneIndexAt(newTime);
	
	if (direction > 0 ) {
		if (sceneIndex < ApplicationState.instance.playStructure["scenes"].length - 1) {
			newTime = ApplicationState.instance.playStructure["scenes"][sceneIndex]["endTime"] ;				
		} else {
			newTime = ApplicationState.instance.playTime = ApplicationState.instance.playTimeLength - 0.01;
		}
	}
	else if (direction < 0) {
		if (sceneIndex > 0) {
			var endTime : float = ApplicationState.instance.playStructure["scenes"][sceneIndex - 1]["endTime"];				
			if (newTime != endTime ) {
				Debug.Log("normal");
				newTime = endTime;
			} 
		}
		else { // 0
			newTime = 0.0;
		}
	}

	ApplicationState.instance.playTime = newTime;

}