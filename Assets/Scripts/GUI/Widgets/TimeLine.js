import ApplicationState;


var timeLineStripStyle : GUIStyle;
var speechMarkerTexture : Texture2D;

var actMarkerStyle : GUIStyle;
var sceneMarkerStyle : GUIStyle;
var beatMarkerStyle : GUIStyle;
var flagMarkerStyle : GUIStyle;


var anotationBarStyle : GUIStyle;
var anotationDotStyle : GUIStyle;

var drawAnotations : boolean = false;

var timeLineWidth : int;
var breakMainTimeLineInCount : float;

// markers

private var __speechMarkers : Hashtable;
private var __actMarkers : Array;
private var __sceneMarkers : Array;
private var __beatMarkers : Array;
private var __sceneAnotationBars : Array;
private var __sceneAnotationIndexes : Array;

private var __speechMarkerHeight : int = 27;
private var __actMarkerHeight : int = 27;
private var __actMarkerWidth : int = 27; 
private var __sceneMarkerHeight : int = 20;
private var __sceneMarkerWidth : int = 20;
private var __beatMarkerHeight : int = 8;
private var __timeLineHeight : int = 27;
private var __scalingFactor : float;

private var __annotationsWindowControl : AnnotationsWindowControl;

private var __characterSpeechBackgroundStyles : Hashtable;

private var __showAnnotationTooltip : boolean;
private var __changedAnnotationState : boolean;
private var __selectedAnnotation : int =0;
private var __startedCountingAt : float;

function Awake()
{
	breakMainTimeLineInCount = 1;
	__scalingFactor = 1.0;
	
	__showAnnotationTooltip = false;
	__changedAnnotationState = false;
}

function Start()
{
	__annotationsWindowControl = GameObject.Find("AnnotationsWindow").GetComponent(AnnotationsWindowControl);
}

public function DrawGUI()
{
	GUI.Label( Rect(0, 0, timeLineWidth, __timeLineHeight), "", timeLineStripStyle);


	drawActMarkers();
	drawSceneMarkers();
	drawBeatMarkers();
	
	if(drawAnotations) {
		drawSceneAnotationMarkers();
	}
	
	//drawFlagMarkers();
	//drawSpeechMarkers();
	

}

public function FinishInitialization()
{
	__characterSpeechBackgroundStyles = Hashtable();
	__speechMarkers                   = Hashtable();
	__actMarkers                      = Array();
	__sceneMarkers                    = Array();
	__beatMarkers                     = Array();
	__sceneAnotationBars              = Array();
	__sceneAnotationIndexes			  = Array();
	
	for (var characterKey in ApplicationState.instance.playStructure["characters"].Keys) {

		__characterSpeechBackgroundStyles[characterKey] = new GUIStyle();
		__speechMarkers[characterKey] = new Array();
		
		var tex : Texture2D = Instantiate(speechMarkerTexture);

		for (var i : int = 0 ; i < tex.width; i++) {
			for (var j : int = 0 ; j < tex.height; j++) {
			
				tex.SetPixel(i, j, tex.GetPixel(i,j) * ApplicationState.instance.playStructure["characters"][characterKey]["color"]);
			}
		}
		tex.Apply();
		
		__characterSpeechBackgroundStyles[characterKey].normal.background = tex;
	}


	//createSpeechMarkers();
	createActMarkers();
	createSceneMarkers();
	createBeatMarkers();
	//createSceneAnotations();

}

function setScalingFactor( scalingFactor : float)
{	
	__scalingFactor = scalingFactor;
}

function drawSpeechMarkers()
{
	
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 0, workingArea, __speechMarkerHeight));
	
	for (var characterKey in __speechMarkers.Keys) {
		for (var currentRect : Rect in 	__speechMarkers[characterKey]) {

			GUI.Label(Rect(currentRect.x * __scalingFactor,
						   currentRect.y,
						   currentRect.width * __scalingFactor,
						   currentRect.height), "", __characterSpeechBackgroundStyles[characterKey]);	
			
		}
	}
	
	GUI.EndGroup();
}


function createSpeechMarkers()
{
	
	var currentPosition : float;
	var currentWidth : float;
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	
	
	for (scene in ApplicationState.instance.playStructure["scenes"]) {	
		for (line in scene["lines"]) {
			
			currentPosition = 1.0 * (line["startTime"] * workingArea / ApplicationState.instance.playTimeLength);
			var endTime : float = line["startTime"] + ApplicationState.getLineTime(line["text"], line["pace"]);

			currentWidth = 1.0 * (endTime * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
			
			__speechMarkers[line["character"]].Push( new Rect( currentPosition , 0 , currentWidth, __speechMarkerHeight) );

		}
	}	
}

function drawSceneAnotationMarkers()
{
	
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	var currentStyle : GUIStyle;
	var currendWidthScaling : float;
	
	if (__showAnnotationTooltip && 
		Time.time - __startedCountingAt > ApplicationState.instance.delayForTooltip && 
		!__changedAnnotationState ) {
		
		var separated = ApplicationState.instance.currentToolTip.Split("_"[0]);
		__selectedAnnotation = float.Parse(separated[0]);
		__annotationsWindowControl.selectAnotationState(__selectedAnnotation);	
		__changedAnnotationState = true;
			
	}
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 9, workingArea, __speechMarkerHeight));
	
	count = 0;
	
	for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
		if (!annotation.Contains("character")) {
				
			currentPosition = 1.0 * (annotation["startTime"] * workingArea / ApplicationState.instance.playTimeLength);
			
			// change
			if (annotation.ContainsKey("endTime")) {
				currentGUIStyle = anotationBarStyle;
				currentWidth = 1.0 * (annotation["endTime"] * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
				widthScaling = __scalingFactor;
			} else {
				currentGUIStyle = anotationDotStyle;
				currentWidth = 6; //XXX temp
				widthScaling = 1.0;
			}

			GUI.Label(Rect(currentPosition * __scalingFactor,
						   		0,
						   		currentWidth * widthScaling,
						   		6),GUIContent("", count + "_ANNOTATION-STYLE_" + __annotationsWindowControl.getAnnotation(count)) , currentGUIStyle);
			

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
			// 						   		6), "", currentGUIStyle)) {
			// 				__annotationsWindowControl.changeAnotationState(count);
			// 			}
			
		}
		++count;
	}
	
	/*
	var count : int = 0;
	for (var currentRect : Rect in 	__sceneAnotationBars) {

		if (currentRect.width == 6) {
			currendWidthScaling = 1.0;
			currentStyle = anotationDotStyle;
		} else {
			currendWidthScaling = __scalingFactor;
			currentStyle = anotationBarStyle;
		}		
		
		if(GUI.Button(Rect(currentRect.x * __scalingFactor,
					   currentRect.y,
					   currentRect.width * currendWidthScaling,
					   currentRect.height), "", currentStyle)) {
		
			__annotationsWindowControl.changeAnotationState(count);
		}
		++count;
	}
	*/
	
	
	GUI.EndGroup();
}


/*
function createSceneAnotations()
{
	var currentPosition : float;
	var currentWidth : float;
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	
	var count : int = 0;
	for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
	
		if ( ! annotation.Contains("character")) {
			currentPosition = 1.0 * (annotation["startTime"] * workingArea / ApplicationState.instance.playTimeLength);

			if (annotation.ContainsKey("endTime")) {
				currentWidth = 1.0 * (annotation["endTime"] * workingArea / ApplicationState.instance.playTimeLength) - currentPosition;
			} else {
				currentWidth = 6; //XXX temp
			} 
			
			__sceneAnotationBars.Push( Rect( currentPosition , 0 , currentWidth, 6) );
			__sceneAnotationIndexes.Push(count);
		}
		++count;
	}
	
}
*/

function removeCharacter(key : String)
{
	__speechMarkers[key] = null;
	__speechMarkers.Remove(key);
}


public function modifyFromWidth(oldWorkingArea : float) 
{
	//modifySpeechMarkersFromWidth(oldWorkingArea);
	modifyActMarkersFromWidth(oldWorkingArea);
	modifySceneMarkersFromWidth(oldWorkingArea);
	modifyBeatMarkersFromWidth(oldWorkingArea);
	
}


function modifySpeechMarkersFromWidth( oldWorkingArea : int )
{
	var currentPosition : float;
	var currentWidth : float;
	var oldStartingPosition : float;
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	

	for (var speechMarkerKey : String in __speechMarkers.Keys) {
		var speechMarker = __speechMarkers[speechMarkerKey];
		
		for (var currentRect : Rect in speechMarker) {
			
			oldStartingPosition = currentRect.x;

			currentPosition = 1.0 * (currentRect.x / oldWorkingArea) * workingArea;
						
			var prevEndTime : float = 1.0 * (currentRect.width + oldStartingPosition) * ApplicationState.instance.playTimeLength / oldWorkingArea;
			currentWidth = (1.0*(prevEndTime * workingArea) / ApplicationState.instance.playTimeLength) - currentPosition;
			
			
			currentRect.x = currentPosition;
			currentRect.width = currentWidth;
		}
	}

}


function drawActMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 0, workingArea, __speechMarkerHeight));
	
	var actName : int = 1;
	
	for (var currentRect : Rect in 	__actMarkers) {

		GUI.Label(Rect(currentRect.x * __scalingFactor,
					   currentRect.y,
					   currentRect.width,
					   currentRect.height), actName.ToString(), actMarkerStyle);	
		++actName;	

	}
	
	GUI.EndGroup();

}


function createActMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var currentPosition : float;
	var act : Hashtable;
	// acts are delimited by their respective end times
	
	// the first act
	__actMarkers.Push( Rect(0, 0, __speechMarkerHeight, __speechMarkerHeight) );

	
	for (var i : int = 0; i < ApplicationState.instance.playStructure["acts"].length - 1; i++) {
		act = ApplicationState.instance.playStructure["acts"][i];
		
		currentPosition = (act["endTime"] * workingArea / ApplicationState.instance.playTimeLength);
		
		__actMarkers.Push( Rect(currentPosition, 0, __actMarkerWidth, __actMarkerHeight) );
	}
}

function modifyActMarkersFromWidth( oldWorkingArea: float)
{
	
	var currentPosition : float;
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;


	for (var currentRect : Rect in __actMarkers) {
		// currentPosition = currentRect.x  + (__actMarkerWidth / 2.0);
		// currentPosition =  currentPosition / oldWorkingArea  * workingArea - (__actMarkerWidth / 2.0);
		// currentRect.x = currentPosition;
		
		currentRect.x = 1.0 * currentRect.x / oldWorkingArea  * workingArea;
		
		
	}
	
}

function drawSceneMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 0, workingArea, __speechMarkerHeight));
	
	
	for (var currentRect : Rect in 	__sceneMarkers) {

		GUI.Label(Rect(currentRect.x * __scalingFactor,
					   currentRect.y,
					   currentRect.width ,
					   currentRect.height), "", sceneMarkerStyle);	

	}
	
	GUI.EndGroup();

}


function createSceneMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var currentPosition : float;

	for (var i : int; i < ApplicationState.instance.playStructure["scenes"].length -1; i++) {
		var scene : Hashtable = ApplicationState.instance.playStructure["scenes"][i];
		currentPosition = (scene["endTime"] * workingArea / ApplicationState.instance.playTimeLength);
		__sceneMarkers.Push( Rect(currentPosition, 0, __sceneMarkerWidth, __sceneMarkerHeight) );

	}
	
}

function modifySceneMarkersFromWidth(oldWorkingArea : float)
{
	var currentPosition : float;
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;


	for (var currentRect : Rect in __sceneMarkers) {
		// currentPosition = currentRect.x  + (__sceneMarkerWidth / 2.0) ;
		// 	currentPosition =  currentPosition / oldWorkingArea  * workingArea - (__sceneMarkerWidth / 2.0);
		// 	currentRect.x = currentPosition;
		currentRect.x = 1.0 * currentRect.x / oldWorkingArea  * workingArea;
	}
	
	
}


function drawBeatMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 0, workingArea, __speechMarkerHeight));

	for (var currentRect : Rect in 	__beatMarkers) {

		GUI.Label(Rect(currentRect.x * __scalingFactor,
					   currentRect.y,
					   currentRect.width  * __scalingFactor,
					   currentRect.height) , "", beatMarkerStyle);	

	}
	
	GUI.EndGroup();
}

function createBeatMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var previousPosition : int = 0; //startTimeLineAtX;
	var currentPosition : int;
	
	for (act in ApplicationState.instance.playStructure["acts"]) {

		for (scene in act["scenes"]) {
			
			if (ApplicationState.instance.playStructure["scenes"][scene]["beats"]) {
				ApplicationState.instance.playStructure["scenes"][scene]["beats"].Sort();
				for (beat in ApplicationState.instance.playStructure["scenes"][scene]["beats"]) {
				
					currentPosition = (beat * workingArea / ApplicationState.instance.playTimeLength) - 1;
				
					__beatMarkers.push( Rect(previousPosition , __timeLineHeight - __beatMarkerHeight, currentPosition - previousPosition, __beatMarkerHeight) );
				
					previousPosition = currentPosition + 2;
				}
			}
		}
	}
	
	// last beat marker to fill the whole timeline
	
	currentPosition = workingArea;
	__beatMarkers.push( Rect(previousPosition , __timeLineHeight - __beatMarkerHeight, currentPosition - previousPosition, __beatMarkerHeight) );
	
}

function modifyBeatMarkersFromWidth(oldWorkingArea : float)
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;

	for (var currentRect : Rect in __beatMarkers) {
		
		currentRect.x = (1.0*currentRect.x / oldWorkingArea)  * workingArea;
		currentRect.width = (1.0*currentRect.width / oldWorkingArea)  * workingArea;
		
	}
}

function drawFlagMarkers()
{
	var workingArea : float = timeLineWidth * breakMainTimeLineInCount;
	var currentRect : Rect = Rect(0,0,15,30);
	var showPart : int  = -1 * Mathf.Floor(ApplicationState.instance.playTime / ( ApplicationState.instance.playTimeLength / breakMainTimeLineInCount));
	
	GUI.BeginGroup(Rect(showPart * timeLineWidth, 0, workingArea, __speechMarkerHeight));
	
	for (var flagMarkerTime : float in ApplicationState.instance.playStructure["flags"]) {
		currentRect.x = ((1.0 * flagMarkerTime) * (1.0 * workingArea / ApplicationState.instance.playTimeLength));
		GUI.Label( currentRect , "", flagMarkerStyle);
	}
	
	GUI.EndGroup();
}


