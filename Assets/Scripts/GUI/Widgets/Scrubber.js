
import ApplicationState;


public var scrubberRect : Rect = Rect(0, 0, 100, 38);
public var scrubberPointerSize : int = 28;
public var maxXDrag : int = 0;
public var minXDrag : int = 0;

public var scrubberPointer : Texture2D;
public var scrubberLightingTexture : Texture2D;
public var scrubberStyle : GUIStyle;
public var scrubberTextStyle : GUIStyle;
public var scrubberTextBackgroundStyle : GUIStyle;

public var timeBackgroundRect : Rect = Rect(0, 0, 63, 23);

private var __dragging : boolean = false;
private var __initialXPosDragging : float = 0;
private var __previousTime : float = 0;
private var __timeText : String = "00:00:00";
private var __workingArea : int;


function SetToPlayTime() {
	var currentPosition : float = (ApplicationState.instance.playTime * 
								   __workingArea / 
								   ApplicationState.instance.playTimeLength) + 
								   minXDrag;
	scrubberRect.x = currentPosition;
}

function Update()
{

	__workingArea= Screen.width - scrubberRect.width / 2;
	
	if (__dragging) {
		var newXPos : int = Input.mousePosition.x - __initialXPosDragging;
		
		if (newXPos > maxXDrag ) {
			newXPos = maxXDrag;
		} else if (newXPos < minXDrag) {
			newXPos = minXDrag;
		}
		
		scrubberRect.x = newXPos;
		ApplicationState.instance.playTime =  scrubberRect.x * ApplicationState.instance.playTimeLength / __workingArea;
		ApplicationState.instance.playingForward = ApplicationState.instance.playTime > __previousTime;
		__previousTime = ApplicationState.instance.playTime;
	
		if ( ! Input.GetMouseButton(0)) {
			__dragging = false;	
		}
	} else {
		
		SetToPlayTime();

	}
	
	ApplicationState.instance.scrubberDraged = __dragging;

}

function DrawGUI()
{
	// pointer
	GUI.BeginGroup(scrubberRect);
	
	GUI.Label(Rect((scrubberRect.width / 2.0) - 8,
				   scrubberRect.height - 20,
				   scrubberPointerSize,
				   scrubberPointerSize),
			  scrubberPointer);
	GUI.EndGroup();
	
	
	setScruberTime();
	
	
	
	// time box
	
	timeBackgroundRect.x = scrubberRect.x + 
						   scrubberRect.width / 2 - 
						   timeBackgroundRect.width / 2;
	timeBackgroundRect.y = scrubberRect.y - timeBackgroundRect.height + 5;
	
	GUI.Label(timeBackgroundRect, __timeText, scrubberTextBackgroundStyle);
	
	// scrubber
	
	if (GUI.RepeatButton(scrubberRect,
						 "",
						 scrubberStyle)) {
	
		if ( ! __dragging ) {
			__initialXPosDragging = Input.mousePosition.x - scrubberRect.x;
			__dragging = true;
		}
		
	}


}

private function setScruberTime()
{
	var currentTime : float = ApplicationState.instance.playTime;

	var hours : int = currentTime / 3600;
	currentTime -= hours * 3600;
	var minutes : int = currentTime / 60;
	currentTime -= minutes * 60;
	var seconds : int = currentTime;
	
	var hString : String = hours < 10 ? "0" + hours.ToString() : hours.ToString();
	var mString : String = minutes < 10 ? "0" + minutes.ToString() : minutes.ToString();
	var sString : String = seconds < 10 ? "0" + seconds.ToString() : seconds.ToString();
	
	
	__timeText = hString + ":" + mString + ":" + sString;
}

