
import ApplicationState;

private var __directorFlyCam : GameObject;
private var __mainCamera : GameObject;
private var __oldFlyCameraTransform : Transform;
private var __oldBodyCameraTransform : Transform;

private var __stageBounds : Bounds;

private var __flyCamSensitivityX : float;
private var __flyCamSensitivityY : float;
private var __flyCamSpeed : float;

private var __activeCameraIndex : int = 0; // 0 = flycam, 1 = character cams
private var __availableCameraObjects : Array = new Array();

private var __selectedHeadObject : GameObject;
private var __previousSelectedCharacter : GameObject;

private var __start2DPosition : Vector3;
private var __start3DPosition : Vector3;
private var __startUp : Vector3;
private var __startRight : Vector3;
private var __startForward : Vector3;
private var __startPivotPoint : Vector3;
private var __startRotVector : Vector3;
private var __startRotation : Quaternion;

private var movementSpeed : float = 0.1;
private var rotSpeed : float = 40;

private var __rotationX = 0;
private var __rotationY = 0;


var minimumX:float = -360.0; 
var maximumX:float = 360.0; 

var minimumY:float = -90.0; 
var maximumY:float = 90.0; 

var pivotDistance = 10;

function StartTracking(start2DPosition : Vector3)
{
	__startUp         = getActiveCamUp();
	__startRight      = getActiveCamRight();
	__startForward    = getActiveCamForward();	
	__start2DPosition = start2DPosition;
	__start3DPosition = getActiveCamPosition();
	__startPivotPoint = __start3DPosition + (__startForward * pivotDistance);
	__startRotVector  = -1 * __startForward;
	__startRotation   = __mainCamera.transform.rotation;
}

function ZoomCamera(new2DPos : Vector3) {
	var displacement : Vector3 = __start2DPosition - new2DPos;
	
	// Debug.Log(displacement.y);
	pivotDistance -= (displacement.y * movementSpeed) / 5.0;
	if (pivotDistance < 1) {
		pivotDistance = 1;
	} else {
		setActiveCamPosition(__start3DPosition + (__startForward * displacement.y * movementSpeed));
	}
	
}

function TrackCamera(new2DPos : Vector3) {
	var displacement : Vector3 = __start2DPosition - new2DPos;
	
	
	setActiveCamPosition(__start3DPosition +
						(__startUp * displacement.y * movementSpeed) +
						(__startRight * displacement.x * movementSpeed));
	
}

function TumbleCamera(new2DPos : Vector3) {
	var displacement : Vector3 = __start2DPosition - new2DPos;

	if (ApplicationState.instance.floatingCamera) {
		// free moving camera
		__mainCamera.transform.parent.RotateAround(__startPivotPoint, 
												Vector3.up, 
												displacement.x);
		__mainCamera.transform.parent.RotateAround(__startPivotPoint, 
												__mainCamera.transform.parent.TransformDirection(Vector3.right), 
												displacement.y);
	} else {
		// camera should rotate in position		

		var sensitivity : float = 3.0;
		var __xInput : float = Input.GetAxisRaw("Mouse X") * sensitivity;
		var __yInput : float = Input.GetAxisRaw("Mouse Y") * sensitivity;
		// 	
		__rotationX += __xInput;
		__rotationY += __yInput;
	
		__rotationX = ClampAngle (__rotationX, minimumX, maximumX);
		__rotationY = ClampAngle (__rotationY, minimumY, maximumY);
	
		// 
		var xQuaternion : Quaternion = Quaternion.AngleAxis(__rotationX, Vector3.up); 
		var yQuaternion : Quaternion = Quaternion.AngleAxis(__rotationY, Vector3.left); 
		// 
		__mainCamera.transform.parent.localRotation = xQuaternion * yQuaternion;
		
		
		
	}
	__start2DPosition = new2DPos;	
	
}

function ClampAngle (angle:float, min:float, max:float)
{
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}


function Awake()
{
	__directorFlyCam = 	GameObject.Find("Director/DirectorFlyCam");
	__mainCamera = GameObject.Find("Main Camera");
	
	__flyCamSensitivityX = __directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityX;
	__flyCamSensitivityY = __directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityY;
	__flyCamSpeed = __directorFlyCam.GetComponent(CameraControls).speed;
	
	// assume fly cam is on first and it is locked
	setFlyCamSpeed(0, 0, 0);
}

function LateUpdate()
{
	if ( Input.GetButtonDown("GUI Toggle") ) {
		
		// set mouse to pointer
				
		
		ApplicationState.instance.moveCamera = ! ApplicationState.instance.moveCamera ;
		
		if ( ! ApplicationState.instance.moveCamera ) {
			Screen.showCursor = true;			
			//Debug.Log("move camera false");
			setFlyCamSpeed(0, 0, 0);
			// for characters
			setSmoothMouseSpeed(ApplicationState.instance.selectedCharacter, 0, 0);
			setSmoothMouseSpeed(__selectedHeadObject, 0, 0);
	
		} else {
			GameObject.Find("Director").GetComponent(NewCameraControls).SetPointer();
			Screen.showCursor = false;			
			if (__mainCamera.transform.parent == __directorFlyCam.transform) { // parent is flyCam
				setFlyCamSpeed(__flyCamSpeed, __flyCamSensitivityX, __flyCamSensitivityY);
			} else { // a normal character has the camera focus
				setSmoothMouseSpeed(__selectedHeadObject, 6, 6);
			}
		
		}
	}
	
	if ( !ApplicationState.instance.floatingCamera && 
		__previousSelectedCharacter != ApplicationState.instance.selectedCharacter) {
		__previousSelectedCharacter = ApplicationState.instance.selectedCharacter;
		activateBodyCam();	
	}	
}

private function setSmoothMouseSpeed(object_ : GameObject , sensitivityX_ : float, sensitivityY_ : float)
{
	object_.GetComponent(MySmoothMouseLook).sensitivityX = sensitivityX_;
	object_.GetComponent(MySmoothMouseLook).sensitivityY = sensitivityY_;
}

private function setFlyCamSpeed(speed_ : float, sensitivityX_ : float, sensitivityY_ : float)
{
	__directorFlyCam.GetComponent(CameraControls).speed = speed_ ;
	__directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityX = sensitivityX_;
	__directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityY = sensitivityY_;	
}

function activateBodyCam()
{	
	if (ApplicationState.instance.selectedCharacter != null) {
		//~ Debug.Log(ApplicationState.instance.selectedCharacter.name);
		__selectedHeadObject = GameObject.Find(ApplicationState.instance.selectedCharacter.name + "/CameraPosition");
		
		__mainCamera.transform.position = __selectedHeadObject.transform.position;
		__mainCamera.transform.rotation = __selectedHeadObject.transform.rotation;
		__mainCamera.transform.parent = __selectedHeadObject.transform;

		__activeCameraIndex = 1; // actor
		
		__previousSelectedCharacter = ApplicationState.instance.selectedCharacter;
		
	} else {
		Debug.Log("No active character to switch to!");
	}

}

function activateFlyCam()
{
	__mainCamera.transform.position = __directorFlyCam.transform.position;
	__mainCamera.transform.rotation = __directorFlyCam.transform.rotation;
	__mainCamera.transform.parent = __directorFlyCam.transform;
	
	__activeCameraIndex = 0;
}

function translateActiveCam(direction: String, amount: float)
{
	var moveDirection : Vector3;
	if (direction == "left") moveDirection = Vector3(-0.1, 0, 0);
	else if (direction == "right") moveDirection = Vector3(0.1, 0, 0);
	else if (direction == "up") moveDirection = Vector3(0, 0.1, 0);
	else if (direction == "down") moveDirection = Vector3(0, -0.1, 0);
	else if (direction == "forward") moveDirection = Vector3(0, 0, 0.1);
	else if (direction == "backward") moveDirection = Vector3(0, 0, -0.1);
	moveDirection *= amount;
	__mainCamera.transform.parent.Translate(moveDirection);
}


function rotateActiveCam(direction: String, amount: float)
{
	var moveDirection : float;
	if (direction == "up") {
		moveDirection = -0.1 * amount;
		__mainCamera.transform.parent.eulerAngles.x += moveDirection;
	} else if (direction == "down") {
		moveDirection = 0.1 * amount;
		__mainCamera.transform.parent.eulerAngles.x += moveDirection;
	} else if (direction == "right") {
		moveDirection = 0.1 * amount;
		__mainCamera.transform.parent.eulerAngles.y += moveDirection;
	} else if (direction == "left") {
		moveDirection = -0.1 * amount;
		__mainCamera.transform.parent.eulerAngles.y += moveDirection;
	}
	var newRotation : Vector3 = getActiveCamRotation();
	__mainCamera.transform.parent.GetComponent(MySmoothMouseLook).LookAt(newRotation.y - 360, -1 * newRotation.x);
}

function rotateActiveCamAround(point:Vector3, dir:String, amount:float) {
	var axis:Vector3;
	if (dir == "horz") {
		axis = Vector3.up;
	}
	else {
		axis = __mainCamera.transform.parent.TransformDirection(Vector3.right);
	}
	__mainCamera.transform.parent.RotateAround(point, axis, amount);
}

function constrainActiveCam()
{
	Debug.Log("Contains camera? "+ __stageBounds.Contains(__mainCamera.transform.position));
}

function getActiveCamIndex(): int
{
	return __activeCameraIndex;
}

function getActiveCamPosition(): Vector3
{
	return __mainCamera.transform.parent.transform.position;
}

function setActiveCamPosition(pos:Vector3)
{
	if (__activeCameraIndex == 0) {
		__mainCamera.transform.parent.transform.position = pos;
	}
}

function getActiveCamForward() : Vector3 {
	return __mainCamera.transform.forward;
}

function getActiveCamUp() : Vector3 {
	return __mainCamera.transform.up;
}

function getActiveCamRight() : Vector3 {
	return __mainCamera.transform.right;
}

function getActiveCamRotation(): Vector3
{
	return __mainCamera.transform.parent.transform.eulerAngles;
}

function setActiveCamRotation(rot:Vector3)
{
	__mainCamera.transform.parent.transform.eulerAngles = rot;
}

function getActiveCamLookAt(): Vector3
{
	var ray : Ray = Ray(getActiveCamPosition(), __mainCamera.transform.parent.transform.forward);
	var lookAt : Vector3 = ray.GetPoint(5);
	return lookAt;
}

function setActiveCamLookAt(lookAt:Vector3)
{
	if (__activeCameraIndex == 0) __mainCamera.transform.parent.transform.LookAt(lookAt);
}

function FinishInitialization()
{
	__directorFlyCam.transform.position = GameObject.Find("CameraStartPosition").transform.position;
	
	var lookat : GameObject = GameObject.Find("DirectorFlyCamInitLookAt");
	var test : GameObject = new GameObject();
	
	var stage:GameObject = GameObject.FindWithTag("Stage");
	var mesh:Mesh = stage.GetComponentInChildren(MeshFilter).mesh;
	__stageBounds = mesh.bounds;
	
	test.transform.position = __directorFlyCam.transform.position;
	test.transform.rotation = __directorFlyCam.transform.rotation;

	test.transform.LookAt(lookat.transform);

	setFlyCamSpeed(__flyCamSpeed, __flyCamSensitivityX, __flyCamSensitivityY);
	__directorFlyCam.GetComponent(MySmoothMouseLook).LookAt(test.transform.rotation.eulerAngles.y - 360,  -1 * test.transform.rotation.eulerAngles.x);
	__directorFlyCam.GetComponent(MySmoothMouseLook).DoLook(false);
	setFlyCamSpeed(0, 0, 0);
	
	
	var chars : GameObject[];
	chars = GameObject.FindGameObjectsWithTag("Character");
	if (chars.length > 0) ApplicationState.instance.selectedCharacter = chars[chars.length - 1];
	for (var chr:GameObject in chars) {
		if (chr.name != "CharacterModel") {
			ApplicationState.instance.selectedCharacter = chr;
			break;
		}
	}
	if (ApplicationState.instance.selectedCharacter  != null) {
		__selectedHeadObject = GameObject.Find(ApplicationState.instance.selectedCharacter.name + "/CameraPosition");
	}
	
	ApplicationState.instance.initialCameraPosition = getActiveCamPosition();
	ApplicationState.instance.initialCameraRotation = getActiveCamRotation();
	
}
