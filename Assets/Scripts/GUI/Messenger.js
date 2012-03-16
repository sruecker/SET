// For displaying messages to the user

public var gSkin : GUISkin;
public var title : String;
public var message : String;
public var visible : boolean;
public var callback : Function;
public var msgType : int;
public static var SHOW : int = 0;
public static var CONFIRM : int = 1;

function Awake() {
	title = "";
	message = "";
	visible = false;
	callback = null;
	msgType = SHOW;
}

function Start() {
	WindowManager.instance.windowRects[WindowManager.instance.MESSENGER_ID] = new Rect(Screen.width / 2 - 75, Screen.height /2 - 50, 150, 100);
}

function Update () {
}

function OnGUI() {
	if (visible) {
		GUI.skin = gSkin;
		if (msgType == SHOW) {
			WindowManager.instance.windowRects[WindowManager.instance.MESSENGER_ID] = 
				GUI.Window (WindowManager.instance.MESSENGER_ID, 
							WindowManager.instance.windowRects[WindowManager.instance.MESSENGER_ID], 
							DoShowWindow, 
				title);
		} else {
			WindowManager.instance.windowRects[WindowManager.instance.MESSENGER_ID] = 
			GUI.Window (WindowManager.instance.MESSENGER_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.MESSENGER_ID], 
						DoConfirmWindow, 
			title);
		}
	}
}

function DoShowWindow(windowID : int) {
	GUILayout.BeginVertical();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label(message);
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if (GUILayout.Button("OK")) {
		visible = false;
		message = "";
		title = "";
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.EndVertical();
	
	GUI.DragWindow();
}

function DoConfirmWindow(windowID : int) {
	GUILayout.BeginVertical();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.Label(message);
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();
	if (GUILayout.Button("Yes")) {
		visible = false;
		message = "";
		title = "";
		callback(1);
		callback = null;
	}
	if (GUILayout.Button("No")) {
		visible = false;
		message = "";
		title = "";
		callback(0);
		callback = null;
	}
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.EndVertical();
	
	GUI.DragWindow();
}