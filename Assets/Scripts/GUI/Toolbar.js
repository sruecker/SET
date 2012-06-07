
public var style : GUIStyle;
public var toolbarSkin : GUISkin;
public var comboArrow : Texture;
public var addButton : Texture;
public var comboStyle : GUIStyle;
public var loadingStyle : GUIStyle;

private var __toolbarArea : Rect;
private var __backgroundObject : Transform;
private var __fileBrowser : CTreeView;
private var __validator : XMLValidator;
private var __cameraManager : ManageCameras;
private var __timeLineWindowControl: TimeLineWindowControl;

// views combo
private var __selectedView : String;
private var __views : String[];
private var __viewsScroll : Vector2;

static var file : int = 0;
static var edit : int = 1;
static var view : int = 2;
static var load : int = 3;
static var compare : int = 4;
static var views : int = 5;
private var __menuClick : int;

function Awake() {
	__toolbarArea = Rect(0, 0, Screen.width, 22);
	__fileBrowser = gameObject.GetComponentInChildren(CTreeView);
	__fileBrowser.visible = false;
	__fileBrowser.location = "./";
	__fileBrowser.winId = WindowManager.instance.FILEBROWSER_ID;
	__fileBrowser.winRect = Rect(Screen.width / 2 - 185,35,370,50);
	__validator = gameObject.GetComponentInChildren(XMLValidator);
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);	
	__timeLineWindowControl = GameObject.Find("TimeLineWindow").GetComponent(TimeLineWindowControl);
	
	__menuClick = -1;
	__selectedView = "";
}

function OnGUI() {
	GUI.skin = toolbarSkin;
	
	if(ApplicationState.instance.loadingNewFile) {
	  	GUI.depth = 0;
		GUI.Label(Rect(0,0,Screen.width, Screen.height), "Loading...", loadingStyle);
	}
	
	WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_ID] = 
		GUI.Window (WindowManager.instance.TOOLBAR_ID, 
					WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_ID], 
					DoToolbar, 
		"");
		GUI.BringWindowToFront(WindowManager.instance.TOOLBAR_ID);
	
	if (__menuClick != -1) {
		WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_MENU_ID] = 
			GUI.Window (WindowManager.instance.TOOLBAR_MENU_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_MENU_ID], 
						DoToolbarMenu, 
			"");
		GUI.BringWindowToFront(WindowManager.instance.TOOLBAR_MENU_ID);
	}
}

function DoToolbar() {
	GUILayout.BeginArea(__toolbarArea);
	GUILayout.BeginVertical();
	GUILayout.BeginHorizontal(style);
	
	if (GUILayout.Button("File")) {
		if (__menuClick == file) __menuClick = -1;
		else __menuClick = file;
	}
	// if (GUILayout.Button("Edit")) {
	// 	if (__menuClick == edit) __menuClick = -1;
	// 	else __menuClick = edit;
	// }
	if (GUILayout.Button("View")) {
		if (__menuClick == view) __menuClick = -1;
		else __menuClick = view;
	}
	// if (GUILayout.Button("Load")) {
	// 		if (__menuClick == load) __menuClick = -1;
	// 		else __menuClick = load;
	// 	}
	// 	if (GUILayout.Button("Compare")) {
	// 		if (__menuClick == compare) __menuClick = -1;
	// 		else __menuClick = compare;
	// 	}
	
	// GUILayout.Space(15);
	// GUILayout.Label("||");
	// GUILayout.Space(15);
	// GUILayout.Label("Views:");
	// __selectedView = GUILayout.TextField(__selectedView, GUILayout.MinWidth(60), GUILayout.MaxWidth(60));
	// if (GUILayout.Button(comboArrow)) {
	// 	if (__menuClick == views) __menuClick = -1;
	// 	else __menuClick = views;
	// }
	// if (GUILayout.Button(addButton)) {
	// 	DoViewAdded();
	// }
	
	GUILayout.FlexibleSpace();
	
	GUILayout.EndHorizontal();
	GUILayout.EndVertical();
	GUILayout.EndArea();
}

function DoToolbarMenu() {
	switch (__menuClick) {
		case file:
			WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_MENU_ID] = Rect(0, 23, 80, 100);
			GUILayout.BeginArea(Rect(0, 0, 80, 100));
			GUILayout.BeginVertical(style, GUILayout.Width(80));
			if (GUILayout.Button("Open")) {
				__menuClick = -1;
				__fileBrowser.setFileMode(__fileBrowser.OPEN);
				__fileBrowser.visible = true;
			}
			
			if (GUILayout.Button("Save")) {
				__menuClick = -1;
				SaveFile(ApplicationState.instance.playToLoad);
			}
			
			if (GUILayout.Button("Save As...")) {
				__menuClick = -1;
				__fileBrowser.setFileMode(__fileBrowser.SAVE);
				__fileBrowser.visible = true;
			}
			
			GUILayout.EndVertical();
			GUILayout.EndArea();
			break;
		case view:
			WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_MENU_ID] = Rect(48, 23, 165, 255);
			GUILayout.BeginArea(Rect(0, 0, 165, 255));
			GUILayout.BeginVertical(style, GUILayout.Width(165));
			/*
			for (var winId:int in WindowManager.instance.windowGroups["floating"].Keys) {
				if (GUILayout.Button("Restore "+WindowManager.instance.windowGroups["floating"][winId])) {
					WindowManager.instance.restoreWindow(winId);
					__menuClick = -1;
				}
			}
			*/
			
			
			/*
			if (GUILayout.Button("Restore GUI")) {
				WindowManager.instance.restoreWindow(-1);
				__menuClick = -1;
			}
			if (GUILayout.Button("Restore All")) {
				WindowManager.instance.restoreWindow(-2);
				__menuClick = -1;
			}
			*/
			
			if(GUILayout.Button("Toggle minimap")) {
				ApplicationState.instance.showMinimap = ! ApplicationState.instance.showMinimap;
				__menuClick = -1;	
			}
			
			if(GUILayout.Button("Toggle annotations window")) {
				ApplicationState.instance.showAnnotations = ! ApplicationState.instance.showAnnotations;
				__menuClick = -1;					
			}
			
			if(GUILayout.Button("Toggle subcontrols")) {
				ApplicationState.instance.showSubcontrols = ! ApplicationState.instance.showSubcontrols;	
				__menuClick = -1;				
			}
			
			if(GUILayout.Button("Toggle anchors")) {
				ApplicationState.instance.showAxis = !ApplicationState.instance.showAxis;
				__menuClick = -1;				
			}
			
			if(GUILayout.Button("Toggle text annotations")) {
				ApplicationState.instance.showOnScreenTextAnnotations = !ApplicationState.instance.showOnScreenTextAnnotations;
				__menuClick = -1;				
			}
			
			if(GUILayout.Button("Toggle image annotations")) {
				ApplicationState.instance.showOnScreenImageAnnotations = !ApplicationState.instance.showOnScreenImageAnnotations;
				__menuClick = -1;				
			}
			
			if (GUILayout.Button("Restore time line")) {
				__timeLineWindowControl.resetBottomWindow(200);			
				__menuClick = -1;
			}
			
			GUILayout.EndVertical();
			GUILayout.EndArea();
			break;
		// case views:
		// 	WindowManager.instance.windowRects[WindowManager.instance.TOOLBAR_MENU_ID] = Rect(203, 23, 100, 60);
		// 	GUILayout.BeginArea(Rect(0, 0, 100, 60));
		// 	GUILayout.BeginVertical(style);
		// 	__viewsScroll = GUILayout.BeginScrollView(__viewsScroll);
		// 	for (var view:String in ApplicationState.instance.playStructure["views"].Keys) {
		// 		if (GUILayout.Button(view)) {
		// 			ApplicationState.instance.currentSelectedView = view;
		// 			DoViewSelected();
		// 			__menuClick = -1;
		// 			__viewsScroll = Vector2(0, 0);
		// 		}
		// 	}
		// 	GUILayout.EndScrollView();
		// 	GUILayout.EndVertical();
		// 	GUILayout.EndArea();
		// 	break;
	}
}

function OpenFile(filename:String) {
	//~ var xsdfile : String = Application.dataPath+"/Resources/XML/play.xsd";
	var valid : boolean = __validator.ValidateXml(filename);
	if (valid) {
		ApplicationState.instance.loadPlay(filename);
		// Application.LoadLevel("SceneReloader");
	} else {
		ApplicationState.instance.showMessage("Error", "The selected play file wasn't valid.");
	}
}

function SaveFile(filename:String) {
	//~ Debug.Log(filename);
	ApplicationState.instance.savePlayFile(filename);
	// TODO check if the file was actually saved successfully
	ApplicationState.instance.showMessage("Info", "Your file was saved successfully.");
}

function FixedUpdate() {
	if (__fileBrowser.visible) {
		WindowManager.instance.windowRects[WindowManager.instance.FILEBROWSER_ID] = getTreeBrowserWindowRect();
	} else {
		WindowManager.instance.windowRects[WindowManager.instance.FILEBROWSER_ID] = Rect(0,0,0,0);		
	}
}

// private function DoViewAdded() {
// 	var newView : Hashtable = new Hashtable();
// 	newView["location"] = __cameraManager.getActiveCamPosition();
// 	newView["lookAt"] = __cameraManager.getActiveCamLookAt();
// 	
// 	var viewsHash : Hashtable = ApplicationState.instance.playStructure["views"];
// 	// TODO make sure view name is valid XML text
// 	viewsHash[__selectedView] = newView;
// 	
// 	//SetViews();
// 	ApplicationState.instance.currentSelectedView = __selectedView;
// 	ApplicationState.instance.showMessage("Info", __selectedView + " was successfully added.");
// }

// private function DoViewSelected() {
// 	var viewHash : Hashtable = ApplicationState.instance.playStructure["views"][ApplicationState.instance.currentSelectedView];
// 	if (viewHash != null) {
// 		__cameraManager.setActiveCamPosition(viewHash["location"]);
// 		__cameraManager.setActiveCamLookAt(viewHash["lookAt"]);
// 	}
// }

public function getTreeBrowserWindowRect(): Rect {
	return __fileBrowser.winRect;
}

// private function SetViews() {
// 	var tempArray:Array = [];
// 	for (var view in ApplicationState.instance.playStructure["views"]) {
// 		tempArray.push(view.Key);
// 	}
// 	__views = tempArray.ToBuiltin(String);
// }

public function FinishInitialization() {
	//SetViews();
}