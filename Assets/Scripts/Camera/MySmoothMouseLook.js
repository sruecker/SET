

import ApplicationState;

var sensitivityX:float = 6.0; 
var sensitivityY:float = 6.0; 
var inputWeight : float = 0.8;

var minimumX:float = -360.0; 
var maximumX:float = 360.0; 

var minimumY:float = -90.0; 
var maximumY:float = 90.0; 


private var __bufferSize : int = 10;
private var __xInput : float = 0.0; 
private var __yInput : float = 0.0; 
private var __xInputBuffer = new Array(__bufferSize); 
private var __yInputBuffer = new Array(__bufferSize); 
private var __bufferWeights = new Array(__bufferSize);
private var __currentBuffer = 0;
private var __rotationX : float = 0.0; 
private var __rotationY : float = 0.0; 
private var __originalRotation : Quaternion;


function LateUpdate () {
	DoLook(true);
}

function DoLook(useBuffer:boolean)
{
	if (sensitivityX > 0 || sensitivityY > 0) {
		__xInput = Input.GetAxisRaw("Mouse X") * sensitivityX;
		__yInput = Input.GetAxisRaw("Mouse Y") * sensitivityY;
		
		if (useBuffer) {
			__xInputBuffer[__currentBuffer] = __xInput;
			__yInputBuffer[__currentBuffer] = __yInput;
			__xInput = 0.0;
			__yInput = 0.0;
		
			var currentIndex:int = 0;
			for (var i:int = 0; i<__bufferSize; i++) {
				currentIndex = (__currentBuffer + i) % __bufferSize;
				__xInput += __xInputBuffer[currentIndex] * __bufferWeights[i];
				__yInput += __yInputBuffer[currentIndex] * __bufferWeights[i];
				
			}
			__xInput /= __bufferSize;
			__yInput /= __bufferSize;
		}

		__rotationX += __xInput;
		__rotationY += __yInput;

		__rotationX = ClampAngle (__rotationX, minimumX, maximumX);
		__rotationY = ClampAngle (__rotationY, minimumY, maximumY);
		
		
		var xQuaternion : Quaternion = Quaternion.AngleAxis(__rotationX, Vector3.up); 
		var yQuaternion : Quaternion = Quaternion.AngleAxis(__rotationY, Vector3.left); 
		
		transform.localRotation = xQuaternion * yQuaternion;
		//transform.localRotation =  __originalRotation *   xQuaternion * yQuaternion;
		
		__currentBuffer = (__currentBuffer+1) % 10;
	}
}

function LookAt( rotX : float , rotY: float)
{
	__rotationX = rotX;
	__rotationY = rotY;
	
}

function Start () 
{
	// Make the rigid body not change rotation
   	if (rigidbody)
		rigidbody.freezeRotation = true;
		
	__originalRotation = transform.localRotation; 
	var currentWeight:float = 1.0;	
	for (var i:int = 0; i<__bufferSize; i++) {
		__bufferWeights[i] = 1.0 * currentWeight;
		currentWeight *= inputWeight;
		__xInputBuffer[i] = 0.0;
		__yInputBuffer[i] = 0.0;
	}	
}

function ClampAngle (angle:float, min:float, max:float)
{
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp (angle, min, max);
}

