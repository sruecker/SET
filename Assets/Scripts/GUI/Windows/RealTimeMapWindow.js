import WindowManager;

class RealTimeMapWindow extends ToolTipSender {


	// public var emptyGuiSkin : GUISkin;
	public var guiSkin : GUISkin;
	public var realTimeMapStyle : GUIStyle;
	public var realTimeMapTexture : RenderTexture;
	public var realTimeCloseMapTexture : RenderTexture;
	public var presetOnTexture : Texture2D;
	public var presetOffTexture : Texture2D;
	public var addLocationTexture : Texture2D;
	public var removeLocationTexture : Texture2D;
	public var cameraCursor : Texture2D;
	public var blackPixel : Texture2D;
	private var mapCloseup : boolean;
	private var newHeight : float;
	private var mapCamera : Camera;
	private var cameraObject : GameObject;
	private var __mapPositions : Hashtable;
	private var __cameraManager : ManageCameras;
	private var __noCamera : String = null; 
	private var __mapWidth : int = 190;
	var test :int = 20;

	function Start() {
	 	newHeight = realTimeMapTexture.height * __mapWidth / realTimeCloseMapTexture.width;	
		WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID].height = newHeight + 25;	
	}

	function Awake() {
		mapCloseup = false;
		__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);	
		ApplicationState.instance.currentSelectedView = __noCamera;
	
	}

	function FinishInitialization() {
		__mapPositions = new Hashtable();
		mapCamera = GameObject.Find("Camera Map").GetComponent(Camera);
		cameraObject = GameObject.Find("Main Camera");
	}

	function OnGUI() {
	
	    // Register the window. Notice the 3rd parameter	
		// GUI.skin = emptyGuiSkin;
		GUI.skin = guiSkin;

		if (WindowManager.instance.showMiniMap){
			WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID] = 
				GUI.Window (WindowManager.instance.REAL_TIME_MAP_ID, 
							WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID], 
							DoWindow, 
							"", 'customWindow');
		}
	}

	private function CacheMapPositions() {
		__mapPositions.Clear();
		for (var view in ApplicationState.instance.playStructure["views"]) {
			var mapVec : Vector3 = mapCamera.WorldToViewportPoint(view.Value["location"]);
		    __mapPositions[view.Key] = mapVec;
		}
	}

	private function addView() {
		var newView : Hashtable = new Hashtable();
		newView["location"] = __cameraManager.getActiveCamPosition();
		newView["lookAt"] = __cameraManager.getActiveCamLookAt();
	
		// TODO make sure view name is valid XML text
	
		var newEntry : String = "View " + ApplicationState.instance.playStructure["views"].Count;
		newView["name"] = newEntry;
		ApplicationState.instance.playStructure["views"][newEntry] = newView;
		ApplicationState.instance.currentSelectedView = newEntry;

	}

	private function removeView() {
	
		var viewsHash : Hashtable = ApplicationState.instance.playStructure["views"];
	
		if (ApplicationState.instance.currentSelectedView && 
			viewsHash.Contains(ApplicationState.instance.currentSelectedView)) {
				viewsHash.Remove(ApplicationState.instance.currentSelectedView);
				ApplicationState.instance.currentSelectedView = __noCamera;
		
		}
	}

	function get2DPositionFrom3D(pos3D : Vector3, width : float, height : float) {
	
		var viewPortPos : Vector3 = mapCamera.WorldToViewportPoint(pos3D);	
		return Vector2(viewPortPos.x * width - cameraCursor.width/2.0,
					   height * (1.0 - viewPortPos.y) - cameraCursor.height/2.0);
		// return Vector2(__mapWidth/2.0, newHeight/2.0);
	}

	function DoWindow(windowID : int) {
		// GUI.skin = emptyGuiSkin;
	
		GUI.DrawTexture(Rect(5, 5, __mapWidth, newHeight), blackPixel);
		GUI.DrawTexture(Rect(5, 5, __mapWidth, newHeight), realTimeMapTexture);
	
		// draw over texture
	
		// get camera position
	
		var camera3DPosition : Vector3 = cameraObject.transform.position;
	
		// turn it into pos in 2d based on camera size
	
		var camera2DPosition = get2DPositionFrom3D(camera3DPosition, __mapWidth, newHeight);
	
		// render cursor
	
		var matrixBackup : Matrix4x4 = GUI.matrix;
		GUIUtility.RotateAroundPivot(
			cameraObject.transform.parent.transform.eulerAngles.y,
			Vector2(camera2DPosition.x + Mathf.RoundToInt(cameraCursor.width / 2), camera2DPosition.y + Mathf.RoundToInt(cameraCursor.width / 2))
		);	
		GUI.DrawTexture(Rect(camera2DPosition.x, 
							camera2DPosition.y, 
							cameraCursor.width, 
							cameraCursor.height), 
						cameraCursor);
		GUI.matrix = matrixBackup;
	
	
	
		// cache map positions so we dont have to compute them every iteration
		if (ApplicationState.instance.playStructure["views"].Count != __mapPositions.Count) {
			CacheMapPositions();
		}
	
		// add buttons at mouse positions
		for (var view in ApplicationState.instance.playStructure["views"]) {
		
			var mapVec : Vector3 = __mapPositions[view.Key];
			mapVec.x = __mapWidth * mapVec.x;
			mapVec.y = newHeight - newHeight*mapVec.y;
			var buttonSize : int = 10;
			var buttonTexture : Texture2D;
		
			if (ApplicationState.instance.currentSelectedView != __noCamera && 
				ApplicationState.instance.currentSelectedView == view.Key) {
				buttonTexture = presetOnTexture;
			} else {
				buttonTexture = presetOffTexture;
			}
		
		
			if (GUI.Button(Rect(mapVec.x - buttonSize/2, mapVec.y - buttonSize/2, 
								buttonSize, buttonSize), 
						   GUIContent(buttonTexture, view.Key), realTimeMapStyle)) {
				__cameraManager.setActiveCamPosition(view.Value["location"]);
				__cameraManager.setActiveCamLookAt(view.Value["lookAt"]);
				ApplicationState.instance.currentSelectedView = view.Key;
			}
		
		
		}
	
	
		// if (GUI.Button(Rect(256-80, 256, 100, 25), "Switch")) {
		// 	mapCloseup = ! mapCloseup;
		// }
	
	
		// lower controls
		var __lowerMenuHeight : int = 25;
		var __lowerButtonSize : int = 14;
		// GUI.BeginGroup(Rect(0, newHeight + 7 , __mapWidth, __lowerMenuHeight));
		// GUILayout.BeginHorizontal();
		var toolPos : Rect;
		var styleString : String = "_POSITION-STYLE_";
		var toolTipPreString : String;
	
		var views : Hashtable = ApplicationState.instance.playStructure["views"];
		if (ApplicationState.instance.currentSelectedView != __noCamera) {
			var view : Hashtable = ApplicationState.instance.playStructure["views"][ApplicationState.instance.currentSelectedView];
		
			view["name"] = GUI.TextField(Rect(2, newHeight+2, 100, __lowerMenuHeight-4), view["name"], 22);

			if (view["location"] != __cameraManager.getActiveCamPosition()) {
				ApplicationState.instance.currentSelectedView = __noCamera;
			}
		
		} 
		/*
		else {
			//GUILayout.TextField("", 22);
			GUILayout.FlexibleSpace();
		}
		*/
		var buttonSpacing : int = 8;
		var winRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID];
		toolPos = Rect(__mapWidth - __lowerButtonSize - 15 , newHeight+7 ,__lowerButtonSize,__lowerButtonSize);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;

		if(GUI.Button(toolPos,GUIContent(addLocationTexture, toolTipPreString+"Add position"), 'customButton')) {
			addView();
		}


		toolPos = Rect(__mapWidth - 10 , newHeight+7 ,__lowerButtonSize,__lowerButtonSize);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
	
		if(GUI.Button(toolPos, GUIContent(removeLocationTexture, toolTipPreString+"Remove position"), 'customButton')) {
			removeView();
		}

	
		// GUILayout.Space(buttonSpacing);

		// GUILayout.EndHorizontal();
		// GUI.EndGroup();
	
		GUI.DragWindow();
	
		var windowRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID];
	    WindowManager.instance.windowRects[WindowManager.instance.REAL_TIME_MAP_ID] = WindowManager.instance.restrictToWindow(windowRect);
	}
}