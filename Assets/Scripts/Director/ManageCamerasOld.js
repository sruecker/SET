
import ApplicationState;

private var __directorBodyCam : GameObject;
private var __directorBodyCamPosition : GameObject;
private var __directorFlyCam : GameObject;
private var __mainCamera : GameObject;
private var __oldFlyCameraTransform : Transform;
private var __oldBodyCameraTransform : Transform;

private var __stageBounds : Bounds;

private var __bodyCamSensitivityX : float;
private var __bodyCamSensitivityY : float;
private var __bodyCamSpeed : float;

private var __flyCamSensitivityX : float;
private var __flyCamSensitivityY : float;
private var __flyCamSpeed : float;

private var __activeCameraIndex : int = 0; // 0 = flycam, 1 = directorcam, rest character cams
private var __availableCameraObjects : Array = new Array();

private var __selectedHeadObject : GameObject;

function Awake()
{
	__directorBodyCam = GameObject.Find("Director/DirectorBodyCam");
	__directorBodyCamPosition = GameObject.Find("Director/DirectorBodyCam/CameraPosition");
	__directorFlyCam = 	GameObject.Find("Director/DirectorFlyCam");
	__mainCamera = GameObject.Find("Main Camera");
	
	__bodyCamSensitivityX = __directorBodyCam.GetComponent(MySmoothMouseLook).sensitivityX;
	__bodyCamSensitivityY = __directorBodyCamPosition.GetComponent(MySmoothMouseLook).sensitivityY;
	__bodyCamSpeed = __directorBodyCam.GetComponent(MyFPSWalker).speed;
	
	__flyCamSensitivityX = __directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityX;
	__flyCamSensitivityY = __directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityY;
	__flyCamSpeed = __directorFlyCam.GetComponent(CameraControls).speed;
	
	// asume fly cam is on first and it is locked
	setBodyCamSpeed(0, 0, 0);
	setFlyCamSpeed(0, 0, 0);
	
	__directorBodyCam.GetComponent(MySmoothMouseLook).sensitivityX = 0;
	__directorBodyCamPosition.GetComponent(MySmoothMouseLook).sensitivityY = 0;
	__directorBodyCam.GetComponent(MyFPSWalker).speed = 0;
}

function LateUpdate()
{
	// if ( Input.GetButtonDown("GUI Toggle") ) {
		ApplicationState.instance.moveCamera = ! ApplicationState.instance.moveCamera ;
		
		if ( ! ApplicationState.instance.moveCamera ) {
			//Debug.Log("move camera false");
			setBodyCamSpeed(0, 0, 0);
			setFlyCamSpeed(0, 0, 0);
			// for characters
			setSmoothMouseSpeed(ApplicationState.instance.selectedCharacter, 0, 0);
			setSmoothMouseSpeed(__selectedHeadObject, 0, 0);

		} else {
			//Debug.Log("move camera true");
			if (__mainCamera.transform.parent == __directorBodyCamPosition.transform) {
				//Debug.Log("body cam");
				setBodyCamSpeed(__bodyCamSpeed, __bodyCamSensitivityX, __bodyCamSensitivityY);
			} else if (__mainCamera.transform.parent == __directorFlyCam.transform) { // parent is flyCam
				//Debug.Log("fly cam");
				setFlyCamSpeed(__flyCamSpeed, __flyCamSensitivityX, __flyCamSensitivityY);
			} else { // a normal character has the camera focus
				//setSmoothMouseSpeed(ApplicationState.instance.selectedCharacter, 6, 0);
				//setSmoothMouseSpeed(__selectedHeadObject, 0, 6);
				//setSmoothMouseSpeed(ApplicationState.instance.selectedCharacter, 6, 0);
				setSmoothMouseSpeed(__selectedHeadObject, 6, 6);
			}
		
		}
	// }	
}

private function setSmoothMouseSpeed(object_ : GameObject , sensitivityX_ : float, sensitivityY_ : float)
{
	object_.GetComponent(MySmoothMouseLook).sensitivityX = sensitivityX_;
	object_.GetComponent(MySmoothMouseLook).sensitivityY = sensitivityY_;
}


private function setBodyCamSpeed(speed_ : float, sensitivityX_ : float, sensitivityY_ : float) 
{
	__directorBodyCam.GetComponent(MyFPSWalker).speed = speed_;
	__directorBodyCam.GetComponent(MySmoothMouseLook).sensitivityX = sensitivityX_;
	__directorBodyCamPosition.GetComponent(MySmoothMouseLook).sensitivityY = sensitivityY_;	
}

private function setFlyCamSpeed(speed_ : float, sensitivityX_ : float, sensitivityY_ : float)
{
	__directorFlyCam.GetComponent(CameraControls).speed = speed_ ;
	__directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityX = sensitivityX_;
	__directorFlyCam.GetComponent(MySmoothMouseLook).sensitivityY = sensitivityY_;
	
}


function activateBodyCam()
{

	
	// change camera
	/*
	__mainCamera.transform.position = __directorBodyCamPosition.transform.position;
	__mainCamera.transform.rotation = __directorBodyCamPosition.transform.rotation;
	__mainCamera.transform.parent = __directorBodyCamPosition.transform;
	*/
	
	if (ApplicationState.instance.selectedCharacter != null) {
		__selectedHeadObject = GameObject.Find(ApplicationState.instance.selectedCharacter.name + "/CameraPosition");
		
		__mainCamera.transform.position = __selectedHeadObject.transform.position;
		__mainCamera.transform.rotation = __selectedHeadObject.transform.rotation;
		__mainCamera.transform.parent = __selectedHeadObject.transform;

		if (ApplicationState.instance.selectedCharacter.tag == "CharacterCam") {
			__activeCameraIndex = 1; // director
		} else if (ApplicationState.instance.selectedCharacter.tag == "Character") {
			__activeCameraIndex = 2; // actor
		}
		
	
	} else {
		Debug.Log("No active character to switch to!");
	}

}

function activateFlyCam()
{
	
	__oldBodyCameraTransform = __directorBodyCamPosition.transform;
	
	__mainCamera.transform.position = __directorFlyCam.transform.position;
	__mainCamera.transform.rotation = __directorFlyCam.transform.rotation;
	__mainCamera.transform.parent = __directorFlyCam.transform;
	
	__activeCameraIndex = 0;
}

function translateActiveCam(direction: String, amount: float)
{
	var moveDirection : Vector3;
	if (direction == "left") moveDirection = new Vector3(-0.1, 0, 0);
	else if (direction == "right") moveDirection = new Vector3(0.1, 0, 0);
	else if (direction == "up") moveDirection = new Vector3(0, 0.1, 0);
	else if (direction == "down") moveDirection = new Vector3(0, -0.1, 0);
	else if (direction == "forward") moveDirection = new Vector3(0, 0, 0.1);
	else if (direction == "backward") moveDirection = new Vector3(0, 0, -0.1);
	moveDirection *= amount;
	if (__activeCameraIndex == 1) {
		__selectedHeadObject.transform.parent.GetComponent(CharacterController).Move(moveDirection);
	} else {
		__mainCamera.transform.parent.Translate(moveDirection);
	}
}

function rotateActiveCam(direction: String, amount: float)
{
	var moveDirection : Vector3;
	var axis : Vector3;
	if (direction == "up") {
		moveDirection = new Vector3(-0.1, 0, 0);
	} else if (direction == "down") {
		moveDirection = new Vector3(0.1, 0, 0);
	} else if (direction == "right") {
		moveDirection = new Vector3(0, 0.1, 0);
	} else if (direction == "left") {
		moveDirection = new Vector3(0, -0.1, 0);
	}
	moveDirection *= amount;
	__mainCamera.transform.parent.Rotate(moveDirection, Space.World);
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

function getActiveCamRotation(): Vector3
{
	return __mainCamera.transform.parent.transform.eulerAngles;
}


function FinishInitialization()
{
	__directorBodyCam.transform.position = GameObject.Find("DirectorStartPosition").transform.position;
	__directorFlyCam.transform.position = GameObject.Find("CameraStartPosition").transform.position;
	
	var lookat : GameObject = GameObject.Find("DirectorFlyCamInitLookAt");
	var test : GameObject = new GameObject();
	
	var stage:GameObject = GameObject.FindWithTag ("Stage");
	var mesh:Mesh = stage.GetComponentInChildren(MeshFilter).mesh;
	__stageBounds = mesh.bounds;
	
	test.transform.position = __directorFlyCam.transform.position;
	test.transform.rotation = __directorFlyCam.transform.rotation;

	test.transform.LookAt(lookat.transform);

	setFlyCamSpeed(__flyCamSpeed, __flyCamSensitivityX, __flyCamSensitivityY);
	__directorFlyCam.GetComponent(MySmoothMouseLook).LookAt(test.transform.rotation.eulerAngles.y - 360,  -1 * test.transform.rotation.eulerAngles.x);
	__directorFlyCam.GetComponent(MySmoothMouseLook).DoLook(false);
	setFlyCamSpeed(0, 0, 0);
	
	
	ApplicationState.instance.selectedCharacter = __directorBodyCam;
	__selectedHeadObject = GameObject.Find(ApplicationState.instance.selectedCharacter.name + "/CameraPosition");

}
