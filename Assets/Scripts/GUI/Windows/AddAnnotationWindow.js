#pragma strict


public var guiSkin : GUISkin;

private var annotationText: String;
private var annotationImagePath : String;
private var annotationLinkedTo : String;
private var annotationStartTime : float;
private var annotationEndTime : float;
private var minAnnotationTime : float;
private var maxAnnotationTime : float;
private var winRect : Rect;
private var winId : int;
private var scrollPosition : Vector2;
private var annotationsControl : AnnotationTexturesControl;

function Awake() {
	annotationsControl = GameObject.Find("AnnotationTexturesWindow").GetComponent(AnnotationTexturesControl);
}

function Start() {
	InintWindowValues();
	minAnnotationTime = 0.0;
	maxAnnotationTime = 1.0;
	winId = WindowManager.instance.ADD_ANNOTATION_ID;
	winRect = WindowManager.instance.windowRects[winId];
	WindowManager.instance.windowRects[winId] = Rect(0,0,0,0);
}

function InintWindowValues(){
	annotationText = '';
	annotationImagePath = '';
	annotationLinkedTo = '';
	annotationStartTime = 0.0;
	annotationEndTime = 0.0;
	scrollPosition = Vector2(0,0);
}

function FinishInitialization() {
	
	maxAnnotationTime = ApplicationState.instance.playTimeLength;
	
}

function OnGUI() {
	GUI.skin = guiSkin;
	
	if (ApplicationState.instance.addAnnotation) {
		
		if (WindowManager.instance.windowRects[winId] == Rect(0,0,0,0)) {
			WindowManager.instance.windowRects[winId] = winRect;
		}
		
		WindowManager.instance.windowRects[WindowManager.instance.ADD_ANNOTATION_ID] = 
			GUI.Window (WindowManager.instance.ADD_ANNOTATION_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.ADD_ANNOTATION_ID], 
						DoWindow, 
						"Add annotation");
					
	}
}

function AddAnnotation() {
	var newAnnotation = Hashtable();
	// need to strip whitespaces

	if (annotationText != '') {
		newAnnotation['text'] = annotationText;
	}
	
	if (annotationImagePath != '') {
		newAnnotation['image'] = annotationImagePath;
		//XXX add image texture
	}
	
	if (annotationLinkedTo != '') {
		newAnnotation['character'] = annotationLinkedTo;
	}
	
	newAnnotation['startTime'] = annotationStartTime;

	if (annotationStartTime != annotationEndTime) {
		newAnnotation['endTime'] = annotationEndTime;
	} 
	newAnnotation['isSelected'] = false;

	annotationsControl.AddAnnotation(newAnnotation);

	
}

function CloseAndResetWindow() {
	InintWindowValues();
	ApplicationState.instance.addAnnotation = false;
	WindowManager.instance.windowRects[winId] = Rect(0,0,0,0);	
}


function Update() {
	if (annotationStartTime > annotationEndTime) {
		annotationEndTime = annotationStartTime;
	}
}

function DoWindow(winId : int) {
	var labelWidth : int = 65;
	var textAreaHeight : int = 65;
	var controlButtonWidth: int = 65;
	var sliderWidth : int = 200;
	
	GUILayout.BeginVertical();
	
	// add text
	GUILayout.BeginHorizontal();
	GUILayout.Label("Text:", GUILayout.Width(labelWidth));
	
	// var h = GUI.skin.GetStyle('textarea').CalcWidth(GUIContent(annotationText, GUILayout.Height(textAreaHeight)));
	// Debug.Log(h);
	
	scrollPosition = GUILayout.BeginScrollView(scrollPosition,GUILayout.Height(textAreaHeight+10));
	annotationText = GUILayout.TextArea(annotationText, 200, GUILayout.Height(textAreaHeight));
	GUILayout.EndScrollView();

	GUILayout.EndHorizontal();

	// add image
	GUILayout.BeginHorizontal();
	GUILayout.Label("Image:", GUILayout.Width(labelWidth));
	annotationImagePath = GUILayout.TextField(annotationImagePath, 100);
	GUILayout.EndHorizontal();
	
	// add linked to
	GUILayout.BeginHorizontal();
	GUILayout.Label("Linked to:", GUILayout.Width(labelWidth));
	annotationLinkedTo = GUILayout.TextField(annotationLinkedTo, 25);
	GUILayout.EndHorizontal();
	
	// add start time
	GUILayout.BeginHorizontal();
	GUILayout.Label("Start time:", GUILayout.Width(labelWidth));
	GUILayout.Label(Helper.instance.FloatToTime(annotationStartTime));
    annotationStartTime = GUILayout.HorizontalScrollbar(annotationStartTime, 1, minAnnotationTime, maxAnnotationTime, GUILayout.Width(sliderWidth));
	GUILayout.EndHorizontal();

	// add end time	
	GUILayout.BeginHorizontal();
	GUILayout.Label("End time:", GUILayout.Width(labelWidth));
	GUILayout.Label(Helper.instance.FloatToTime(annotationEndTime));
    annotationEndTime = GUILayout.HorizontalScrollbar(annotationEndTime, 1, minAnnotationTime, maxAnnotationTime, GUILayout.Width(sliderWidth));
	GUILayout.EndHorizontal();
	
	GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();  
	if (GUILayout.Button('Add')) {
		// add annotation
		AddAnnotation();
		CloseAndResetWindow();
	}
	if (GUILayout.Button('Cancel')) {
		CloseAndResetWindow();
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	
	GUILayout.EndVertical();
	
	
	GUI.DragWindow();
}