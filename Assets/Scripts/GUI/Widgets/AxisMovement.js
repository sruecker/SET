

private var __soundEmitter : GameObject;
private var __direction : Vector3;
private var __screenPoint : Vector3;
private var __offset : Vector3;
private var __origMousePos : Vector2;

function Awake() {
	__soundEmitter = transform.parent.gameObject;
	__direction = transform.position.normalized;
}



function OnMouseDown() {
	ApplicationState.instance.selectedCharacter = null;
	var scanPos : Vector3 = __soundEmitter.transform.position;
	__screenPoint = Camera.main.WorldToScreenPoint(scanPos);	
	__offset = __soundEmitter.transform.position;
	__origMousePos = Input.mousePosition;

}

function OnMouseDrag () {

	var dir : Vector2 = Input.mousePosition - __origMousePos;
	var l : float = dir.magnitude / 80.0;
	var mult = 1;
	
	if (Input.mousePosition.x*__origMousePos.y-__origMousePos.x*Input.mousePosition.y < 0)
		mult = -1;
	if (__direction.y > .5) mult *= -1;
	__soundEmitter.transform.position = __offset + __direction * l * mult;
	
}