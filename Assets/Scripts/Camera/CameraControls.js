
import ApplicationState;

var speed = 6.0;
private var moveDirection = Vector3.zero;

function LateUpdate() {

	moveDirection = new Vector3(Input.GetAxis("Axis X"), 0, Input.GetAxis("Axis Z"));
	moveDirection = transform.TransformDirection(moveDirection) +
					new Vector3(0, Input.GetAxis("Axis Y"), 0);
	moveDirection *= speed;

	
	transform.Translate(moveDirection * Time.deltaTime , Space.World);

	
}

