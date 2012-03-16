var speed = 6.0;
var jumpSpeed = 8.0;
var gravity = 20.0;

private var moveDirection = Vector3.zero;
private var grounded : boolean = false;

function FixedUpdate() {
	if (grounded) {
		// We are grounded, so recalculate movedirection directly from axes
		moveDirection = new Vector3(Input.GetAxis("Axis X"), 0, Input.GetAxis("Axis Z"));
		moveDirection = transform.TransformDirection(moveDirection);
		moveDirection *= speed;
 
	}

	// Apply gravity
	moveDirection.y -= gravity * Time.deltaTime;
	
	// Move the controller
	var controller : CharacterController = GetComponent(CharacterController);
	var flags = controller.Move(moveDirection * Time.deltaTime);
	grounded = (flags & CollisionFlags.CollidedBelow) != 0;
}

@script RequireComponent(CharacterController)