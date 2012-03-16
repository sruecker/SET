
import ApplicationState;
import WindowManager;


class CameraControlsWindow extends ToolTipSender {

// new textures


var upArrowTexture : Texture2D;
var downArrowTexture : Texture2D;
var leftArrowTexture : Texture2D;
var rightArrowTexture : Texture2D;

var centreTexture : Texture2D;
var minusTexture : Texture2D;
var plusTexture : Texture2D;
var backgroundTexture : Texture2D;
var radialButtonTexure : Texture2D;
var rotateTexture : Texture2D;
var translateTexture : Texture2D;


//var forwardArrowTexture : Texture2D;
//var backwardArrowTexture : Texture2D;
//var translateTexture : Texture2D;
//var rotateTexture : Texture2D;
var floatingWindowSkin : GUISkin;

var buttonSize : int = 24;
var buttonYStart : int = 19;
var buttonPadding: int = 5;

private var __cameraMode : int;
private static var ROTATE : int = 0;
private static var TRANSLATE : int = 1;

private var __colliders : Array;
private var __rotatePoint : Vector3;
private var __rotatePointChanged : boolean;

private var __translateMode : boolean;
private var __cameraManager : ManageCameras;
private var __lastToolTip : String;
private var __radialButtonsCoords : Array;

private var __toolTipCentre : String;
private var __toolTipUp : String;
private var __toolTipDown : String;
private var __toolTipLeft : String;
private var __toolTipRight : String;
private var __toolTipFront : String;
private var __toolTipBack : String;
private var __buttonRects : Hashtable;
private var __initRadialClickPos : Vector3;
private var __initWindowPos : Vector2;
private var __initRadialClickPosNormalized : Vector3;
private var __lastRotation : Vector3;
private var __clickedCenter : Vector3;
private var __currentMousePos : Vector3;
private var __radialRotating : boolean;
private var __yawRingUsedDragging : boolean;
private var __timeStartPressed : float;
private var __previousCameraPosition : Vector3;
private var __previousCameraRotation : Vector3;
private var __setPanicCamera : boolean;
private var __resetTypeCamera : boolean;
private var __previousCameraMode : int;

function Awake() {
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);
}

function Start()
{
	__translateMode = true;
	__resetTypeCamera = false;
	//WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].width = backgroundTexture.width;
	//WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].height = backgroundTexture.height;
	
	__radialButtonsCoords = getRadialButtonsCoords(backgroundTexture.width / 2,
												   backgroundTexture.height / 2,
												   45,
												   2);
   	
    __radialRotating = false;													
	__clickedCenter = Vector3(0,0,0);
	__currentMousePos = Vector3(0,0,0);
	__yawRingUsedDragging = true;
	__setPanicCamera = true;
	
	__buttonRects = new Hashtable();
												
	__buttonRects["centre"] = Rect(backgroundTexture.width / 2 - centreTexture.width / 2 , 
							 backgroundTexture.height / 2 - centreTexture.height / 2,
							 centreTexture.width, 
							 centreTexture.height);
	__buttonRects["up"] = Rect(backgroundTexture.width / 2 - upArrowTexture.width / 2 , 
							 backgroundTexture.height / 2 - 30,
							 upArrowTexture.width, 
							 upArrowTexture.height);
	__buttonRects["down"] = Rect(backgroundTexture.width / 2 - downArrowTexture.width / 2 , 
							 backgroundTexture.height / 2 + 18,
							 downArrowTexture.width, 
							 downArrowTexture.height);
	__buttonRects["left"] = Rect(backgroundTexture.width / 2 - 30 , 
							 backgroundTexture.height / 2 - leftArrowTexture.height / 2,
							 leftArrowTexture.width, 
							 leftArrowTexture.height);
	__buttonRects["right"] = Rect(backgroundTexture.width / 2 + 18 , 
							 backgroundTexture.height / 2 - rightArrowTexture.height / 2,
							 rightArrowTexture.width, 
							 rightArrowTexture.height);
	__buttonRects["minus"] = Rect(backgroundTexture.width / 2 - minusTexture.width / 2,
							 backgroundTexture.height - 25,
							 minusTexture.width, 
							 minusTexture.height);
	__buttonRects["plus"] = Rect(backgroundTexture.width / 2 - plusTexture.width / 2,
		 					 14,
							 plusTexture.width, 
							 plusTexture.height);
	__buttonRects["toggle"] = Rect(6,
		 						   9,
								   28, 
								   28);
}

public function setCameraMode(camMode:int) {
	if (camMode != ROTATE && camMode != TRANSLATE) return;
	else __cameraMode = camMode;
	
	if (__cameraMode == ROTATE) setRotatePoint();
}

private function setRotatePoint() {
	var hit:RaycastHit;
	var tempRay:Ray = Camera.main.ScreenPointToRay(Vector3(Screen.width * 0.5, Screen.height * 0.5, 0));
	var pos:Vector3 = __cameraManager.getActiveCamPosition();
	var ray:Ray = new Ray(pos, tempRay.direction);
	var shortestDistance:float = 10000;
	var currentDistance:float;
	
	for (var collider : Collider in __colliders) {
		if (collider.Raycast(ray, hit, shortestDistance)) {
			currentDistance = Vector3.Distance(hit.point, pos);
			if (currentDistance < shortestDistance) {
				shortestDistance = currentDistance;
				__rotatePoint = hit.point;
			}
		}
	}
	
	__rotatePointChanged = false;
}

function OnGUI () {
	GUI.skin = floatingWindowSkin;
    // Register the window. Notice the 3rd parameter 
    if ( false && ! ApplicationState.instance.moveCamera && WindowManager.instance.showYawRing) {
    	WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID] = 
			GUI.Window (WindowManager.instance.CAMCONTROLS_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID], 
						DoMyWindow, 
						backgroundTexture);
    }

	if (__radialRotating) {
		if (! Input.GetMouseButton(0)) {
			__radialRotating = false;
		}
		
		// wait three seconds before rotating
		if (Time.time - __timeStartPressed >= 0.25 && 
			Mathf.Abs(__initRadialClickPos.x - Input.mousePosition.x) < 4 &&
			Mathf.Abs(__initRadialClickPos.y - Input.mousePosition.y) < 4) {
			__yawRingUsedDragging = false;
		}
		
		
		if (!__yawRingUsedDragging) {
			var angle : float= 0;
		
			if (__initRadialClickPos != Input.mousePosition) {
				__currentMousePos.x = Input.mousePosition.x - __clickedCenter.x;
				__currentMousePos.y = Screen.height - Input.mousePosition.y - __clickedCenter.y;
			
				__currentMousePos = __currentMousePos.normalized;
			
				angle = Mathf.Rad2Deg * ( Mathf.Atan2(__currentMousePos.y, __currentMousePos.x) - 
										  Mathf.Atan2(__initRadialClickPosNormalized.y, __initRadialClickPosNormalized.x) );
				
				__rotatePointChanged = true;
			}
			if (__cameraMode == TRANSLATE) {
				__cameraManager.setActiveCamRotation( Vector3(__lastRotation.x, __lastRotation.y + angle, __lastRotation.z) );
			} else {
				__cameraManager.rotateActiveCamAround(__rotatePoint, "horz", angle);
				__initRadialClickPos = Input.mousePosition;
				__initRadialClickPosNormalized.x = Input.mousePosition.x - __clickedCenter.x;
				__initRadialClickPosNormalized.y = Screen.height - Input.mousePosition.y - __clickedCenter.y;
				__initRadialClickPosNormalized = __initRadialClickPosNormalized.normalized;
			}
		} else {
			WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].x = Input.mousePosition.x - 
																						  __initRadialClickPos.x + 
																						  __initWindowPos.x;
			
			WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].y = __initRadialClickPos.y + 
																						  __initWindowPos.y
																						  - Input.mousePosition.y;					
		}
	}
    
}

function Update() {
	// if (Input.GetButtonDown("GUI Toggle")) __rotatePointChanged = true;
	Debug.DrawLine(__cameraManager.getActiveCamPosition(), __rotatePoint, Color.red);
	
	
	if ( ! ApplicationState.instance.floatingCamera && ! __resetTypeCamera) {
		__resetTypeCamera = true;
		__previousCameraMode = __cameraMode;
		setCameraMode(TRANSLATE);
	}
	
	if (ApplicationState.instance.floatingCamera && __resetTypeCamera) {
		__resetTypeCamera = false;
		setCameraMode(__previousCameraMode);
	}
	
}

// adapted from http://en.wikipedia.org/wiki/Midpoint_circle_algorithm

private function getRadialButtonsCoords(x0 : int, y0 : int, radius : int, steps : int) : Array
{

	var result : Array = new Array();
	
	var f : int = 1 - radius;
	var ddF_x : int = 1;
	var ddF_y = -2 * radius;
	var x : int = 0;
	var y : int = radius;
	var stepCount : int = 0;
	
	result.push(Vector2(x0, y0 + radius));
	result.push(Vector2(x0, y0 - radius));
  	result.push(Vector2(x0 + radius, y0));
  	result.push(Vector2(x0 - radius, y0));

	

	while (x < y) {
		if (f >= 0) {
			y--;
			ddF_y += steps;
			f += ddF_y;
		}
	
	
		x++;
		ddF_x += steps;
		f += ddF_x;

		stepCount++;
		if (stepCount == 10) {
			stepCount = 0;
			result.push(Vector2(x0 + x, y0 + y));
			result.push(Vector2(x0 - x, y0 + y));
			result.push(Vector2(x0 + x, y0 - y));
			result.push(Vector2(x0 - x, y0 - y));
			result.push(Vector2(x0 + y, y0 + x));
			result.push(Vector2(x0 - y, y0 + x));
			result.push(Vector2(x0 + y, y0 - x));
			result.push(Vector2(x0 - y, y0 - x));
		}	
		
	}
  	return result;
	
}


// Make the contents of the window
function DoMyWindow (windowID : int) {

	var originRect : Rect = Rect(WindowManager.instance.windowRects[windowID].x, WindowManager.instance.windowRects[windowID].y, 0, 0);
	var toolPos : Rect;
	// minus
	toolPos = __buttonRects["minus"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["minus"],	GUIContent(minusTexture, toolPos+"_POSITION-STYLE_" + "Pitch down"))) {
		if (__cameraMode == TRANSLATE) {
			__cameraManager.rotateActiveCam("down", 6.0);
			__rotatePointChanged = true;
		} else {
			if (__rotatePointChanged) setRotatePoint();
			__cameraManager.rotateActiveCamAround(__rotatePoint, "vert", -1.0);
		}
	}
	
	// plus
	toolPos = __buttonRects["plus"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["plus"], GUIContent(plusTexture, toolPos+"_POSITION-STYLE_" + "Pitch up"))) {
		if (__cameraMode == TRANSLATE) {
			__cameraManager.rotateActiveCam("up", 6.0);
			__rotatePointChanged = true;
		} else {
			if (__rotatePointChanged) setRotatePoint();
			__cameraManager.rotateActiveCamAround(__rotatePoint, "vert", 1.0);
		}
	}

	// radial buttons
	

	if (!__radialRotating) {
		for (var currentCoord : Vector2 in __radialButtonsCoords) {
		
			if(GUI.RepeatButton(Rect(currentCoord.x - radialButtonTexure.width / 2, 
									 currentCoord.y - radialButtonTexure.height / 2,
									 radialButtonTexure.width, 
									 radialButtonTexure.height), 
			 					GUIContent(radialButtonTexure, "Yaw ring"))) {
						
				if (!__radialRotating) {
					// dragging or rotating ?
					__timeStartPressed = Time.time;
					__radialRotating = true;
					__yawRingUsedDragging = true;
					
					__initRadialClickPos = Input.mousePosition;
					
					__initWindowPos.x = WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].x;
					__initWindowPos.y = WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].y;
					
					__lastRotation =  __cameraManager.getActiveCamRotation();
			
					__clickedCenter.x = WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].x + 
										WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].width / 2;
								
					__clickedCenter.y = WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].y + 
										WindowManager.instance.windowRects[WindowManager.instance.CAMCONTROLS_ID].height / 2;
				
				
					__initRadialClickPosNormalized.x = Input.mousePosition.x - __clickedCenter.x;
					__initRadialClickPosNormalized.y = Screen.height - Input.mousePosition.y - __clickedCenter.y;
					__initRadialClickPosNormalized = __initRadialClickPosNormalized.normalized;
				}
			}
		
		}
	}

	// disable translation controls for character cams
	
	if (__cameraManager.getActiveCamIndex() == 1) {
		GUI.enabled = false;
	} else {
		GUI.enabled = true;
	}
	
	// toggle
	toolPos = __buttonRects["toggle"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	var toggleContent : GUIContent;
	if (__cameraMode == TRANSLATE) toggleContent = GUIContent(translateTexture, toolPos+"_POSITION-STYLE_" + "Toggle mode");
	else toggleContent = GUIContent(rotateTexture, toolPos+"_POSITION-STYLE_" + "Toggle mode");
	
	if (GUI.Button(__buttonRects["toggle"], toggleContent)) {
		if (__cameraMode == TRANSLATE) setCameraMode(ROTATE);
		else setCameraMode(TRANSLATE);
	}
	
	// centre
	toolPos = __buttonRects["centre"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.Button(__buttonRects["centre"], GUIContent(centreTexture, toolPos+"_POSITION-STYLE_" + "Reset camera"))) {
		var currentPos : Vector3 = __cameraManager.getActiveCamPosition();
	 	var currentRot : Vector3 = __cameraManager.getActiveCamRotation();
	
		if (currentPos == ApplicationState.instance.initialCameraPosition &&
			currentRot == ApplicationState.instance.initialCameraRotation) {
			__setPanicCamera = false;
		} else {
			__setPanicCamera = true;
		}
		
		if (__setPanicCamera) {	
			__previousCameraRotation = currentRot;
			__previousCameraPosition = currentPos;
			__cameraManager.setActiveCamRotation(ApplicationState.instance.initialCameraRotation);
			__cameraManager.setActiveCamPosition(ApplicationState.instance.initialCameraPosition);
		} else {
			__cameraManager.setActiveCamRotation(__previousCameraRotation);
			__cameraManager.setActiveCamPosition(__previousCameraPosition);
		}
		
		__rotatePointChanged = true;
		//Debug.Log("centre");
	}

	// up
	toolPos = __buttonRects["up"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["up"], GUIContent(upArrowTexture, toolPos+"_POSITION-STYLE_" + "Translate forward"))) {
		__cameraManager.translateActiveCam("forward", 1.0);
		__rotatePointChanged = true;
	}

	// down
	toolPos = __buttonRects["down"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["down"], GUIContent(downArrowTexture, toolPos+"_POSITION-STYLE_" + "Translate backward"))) {
		__cameraManager.translateActiveCam("backward", 1.0);
		__rotatePointChanged = true;
	}

	// left
	toolPos = __buttonRects["left"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["left"], GUIContent(leftArrowTexture, toolPos+"_POSITION-STYLE_" + "Translate left"))) {
		__cameraManager.translateActiveCam("left", 1.0);
		__rotatePointChanged = true;
	}

	// right
	toolPos = __buttonRects["right"];
	toolPos.x += originRect.x;
	toolPos.y += originRect.y;
	if(GUI.RepeatButton(__buttonRects["right"], GUIContent(rightArrowTexture, toolPos+"_POSITION-STYLE_" + "Translate right"))) {
		__cameraManager.translateActiveCam("right", 1.0);
		__rotatePointChanged = true;
	}
		
	GUI.enabled = true;

	UpdateToolTip();
	
	GUI.DragWindow();

}

function FinishInitialization()
{
	__colliders = new Array();
	var stages:GameObject[] = GameObject.FindGameObjectsWithTag("Stage");
	for (var objectAsStage:GameObject in stages) {	
		var cols:Collider[] = objectAsStage.FindObjectsOfType(Collider);
		for (var col:Collider in cols) {
			__colliders.Push(col);
		}
	}

	setCameraMode(ROTATE);
}

}