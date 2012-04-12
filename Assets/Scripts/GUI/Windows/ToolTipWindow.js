
var toolTipWindowStyle : GUIStyle;
var toolTipTextStyle : GUIStyle;
var toolTipAnnotationTextStyle : GUIStyle;
var toolTipAnnotationStyle : GUIStyle;
var toolTipXOffset : int = 10;
var toolTipYOffset : int = 10;
//var delayForTooltip : float = 0.7;

private var __toolTipArea : Vector2;
private var __elapsedTime : float;
private var __starCountTime : float;
private var __lastToolTip : String;
private var __showToolTip : boolean;
private var __startTimer : boolean;
private var __text : String;
private var __currentTextStyle;

function Awake()
{
	
	__showToolTip = false;
	__elapsedTime = 0;
	__starCountTime = 0;
	__startTimer = false;
}

function Update() {
	if (Input.GetKeyDown("l")) {
		ApplicationState.instance.sideLabels = ! ApplicationState.instance.sideLabels;
		Debug.Log(ApplicationState.instance.sideLabels);
	}
}
function OnGUI()
{
	

	if (ApplicationState.instance.currentToolTip != "" && ! __startTimer) {
		__startTimer = true;
		__elapsedTime = 0;
		__starCountTime = Time.time;
		__lastToolTip = ApplicationState.instance.currentToolTip;
	}
	
	if (__startTimer) {
		__elapsedTime = Time.time - __starCountTime;
	}
	
	if (ApplicationState.instance.currentToolTip == "" || 
		ApplicationState.instance.currentToolTip.Contains("_ONMOUSE") ||
		(__elapsedTime < ApplicationState.instance.delayForTooltip && 
		 __lastToolTip != ApplicationState.instance.currentToolTip)) {
	 	__startTimer = false;
	 	__elapsedTime = 0;
		__lastToolTip = ApplicationState.instance.currentToolTip;
	}
	
	if (__elapsedTime > ApplicationState.instance.delayForTooltip && 
		ApplicationState.instance.currentToolTip != "") {	
		
		var currentGUIStyle : GUIStyle;
		var textToShow : String;
		var renderToolTip : boolean = false;
		
		if (ApplicationState.instance.currentToolTip.Contains("ANNOTATION-STYLE")) {
			__text = ApplicationState.instance.currentToolTip.Split("_"[0])[2];
			currentGUIStyle = toolTipAnnotationStyle;
			__toolTipArea.x = 120;
			__toolTipArea.y = 60;
			__currentTextStyle = toolTipAnnotationTextStyle;
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].x = Input.mousePosition.x + toolTipXOffset;
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].y = Screen.height - Input.mousePosition.y + toolTipYOffset;
			renderToolTip = true;
		} else if (ApplicationState.instance.currentToolTip.Contains("POSITION-STYLE")) {
			// __text = ApplicationState.instance.currentToolTip;
			
			var input = ApplicationState.instance.currentToolTip.Split("_"[0]);


			__text = input[2];			
			currentGUIStyle = toolTipWindowStyle;
			__toolTipArea = toolTipTextStyle.CalcSize(GUIContent(__text));
			__toolTipArea.x += 10;
			__toolTipArea.y += 5;
			__currentTextStyle = toolTipTextStyle;
			
			var posString = input[0];	
			var parsedPosition = Regex.Match(posString ,'left:(.+), top:(.+), width:(.+), height:(.+)\\)');		
			var newPos : Vector2;
			if (ApplicationState.instance.sideLabels) {
				newPos = Vector2(parseFloat(parsedPosition.Groups[1].Value) + parseFloat(parsedPosition.Groups[3].Value), 
					   		   parseFloat(parsedPosition.Groups[2].Value) + parseFloat(parsedPosition.Groups[4].Value)/2.0 - __toolTipArea.y/2.0);
			} else {
				newPos = Vector2(parseFloat(parsedPosition.Groups[1].Value) + parseFloat(parsedPosition.Groups[3].Value)/2.0 - __toolTipArea.x/2.0, 
					   		   parseFloat(parsedPosition.Groups[2].Value) - __toolTipArea.y ) ;
			}
			
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].x = newPos.x;
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].y = newPos.y;
			renderToolTip = true;
		}
		if (renderToolTip){
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].width = __toolTipArea.x;
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].height = __toolTipArea.y;
		
			var windRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID];
			if (windRect.x + windRect.width >= Screen.width) {
				windRect.x -= ( windRect.x +  windRect.width) - Screen.width;
				windRect.y += windRect.height;
				WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID] = windRect;
			}
		
			// WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID].y = Screen.height/2;
			WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID] = 
				GUI.Window(WindowManager.instance.TOOLTIP_ID,
						   WindowManager.instance.windowRects[WindowManager.instance.TOOLTIP_ID],
						   DoToolTipWindow,
						   "",
						   currentGUIStyle);
			GUI.BringWindowToFront(WindowManager.instance.TOOLTIP_ID);
		}
	}
	
	
}

function DoToolTipWindow(windowId : int) {
	
	GUI.Label(Rect(5, 0,__toolTipArea.x, __toolTipArea.y), __text, __currentTextStyle);
}