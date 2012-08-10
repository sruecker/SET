


// public var movementSpeed : float  = 0.1;
public var tumbleCursorTexture : Texture2D;
public var trackCursorTexture : Texture2D;
public var zoomCursorTexture : Texture2D;


private var nativeRatio = 1.3333333333333;
private var mouseRect : Rect;
private var cursorSize : int = 20;
// private var currentMouseCameraState : MouseCameraControlState;

private var startingPoint : Vector3;
private var starting3DPosition : Vector3;	
private var noPoint3 : Vector3;
private var __cameraManager : ManageCameras;


function Awake() {
	noPoint3 = Vector3.one*Mathf.Infinity;
	startingPoint = noPoint3;
	ApplicationState.instance.currentMouseCameraState =  MouseCameraControlState.NONE;
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);
	
}

function Start() {
	var currentRatio : float = (0.0 + Screen.width) / Screen.height;
    mouseRect = Rect(0,0,cursorSize,cursorSize);
}

public function SetPointer() {
	Screen.showCursor = true;
	ApplicationState.instance.currentMouseCameraState =  MouseCameraControlState.NONE;
}

public function SetTrack() {
	Screen.showCursor = false;
	ApplicationState.instance.currentMouseCameraState =  MouseCameraControlState.TRACK;
}

public function SetTumble() {
	Screen.showCursor = false;
	ApplicationState.instance.currentMouseCameraState =  MouseCameraControlState.TUMBLE;
}

public function SetZoom() {
	Screen.showCursor = false;
	ApplicationState.instance.currentMouseCameraState =  MouseCameraControlState.ZOOM;
}

function OnGUI() {

	if (!ApplicationState.instance.moveCamera && !Screen.showCursor) {
		var e : Event = Event.current;
		mouseRect.x = e.mousePosition.x - cursorSize/2;
		mouseRect.y = e.mousePosition.y - cursorSize/2;
		GUI.depth = 0;
		var currentCursor : Texture2D;
		switch(ApplicationState.instance.currentMouseCameraState) {
			case MouseCameraControlState.ZOOM:
				currentCursor = zoomCursorTexture;
			break;
			case MouseCameraControlState.TRACK:
				currentCursor = trackCursorTexture;
			break;
			case MouseCameraControlState.TUMBLE:
				currentCursor = tumbleCursorTexture;
			break;
		}
		
		GUI.DrawTexture(mouseRect, currentCursor);
	}
	
}

function Update() {
	
	if (ApplicationState.instance.currentMouseCameraState != MouseCameraControlState.NONE) {
		if (Input.GetMouseButtonDown(0) && !WindowManager.instance.isHitOnInterface(Input.mousePosition)) {
			startingPoint = Input.mousePosition;
			__cameraManager.StartTracking(startingPoint);
		}		
		
		if (startingPoint != noPoint3 && WindowManager.instance.isMouseOnScreen(Input.mousePosition)) {
			switch(ApplicationState.instance.currentMouseCameraState) {
				case MouseCameraControlState.ZOOM:
					__cameraManager.ZoomCamera(Input.mousePosition);
				break;
				case MouseCameraControlState.TRACK:
					__cameraManager.TrackCamera(Input.mousePosition);
				break;
				case MouseCameraControlState.TUMBLE:
					__cameraManager.TumbleCamera(Input.mousePosition);
				break;
			}
		}
		if (Input.GetMouseButtonUp(0)) {
			startingPoint = noPoint3;
		}
	}
}

