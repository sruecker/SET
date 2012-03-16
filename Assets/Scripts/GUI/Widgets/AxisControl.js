

var showTexture : Texture2D;
var renderShowTexture : boolean;
var textureSize : int = 64;

private var __xAxis : GameObject;
private var __yAxis : GameObject;
private var __zAxis : GameObject;

function OnGUI() {
	if (!ApplicationState.instance.showAxis && renderShowTexture) {
		var buttonPosn = Camera.main.WorldToScreenPoint(Vector3(gameObject.transform.position.x,
														gameObject.transform.position.y +1,
														gameObject.transform.position.z));
	
		GUI.Label(Rect(buttonPosn.x, Screen.height - buttonPosn.y,textureSize,textureSize), showTexture);
	}
}

function Awake() {
	renderShowTexture = true;
	__xAxis = gameObject.Find(gameObject.name+'/xAxis');
	__yAxis = gameObject.Find(gameObject.name+'/yAxis');
	__zAxis = gameObject.Find(gameObject.name+'/zAxis');

}

function Update() {
	renderShowTexture = ApplicationState.instance.showAxis;
	__xAxis.renderer.enabled = ApplicationState.instance.showAxis;
	__yAxis.renderer.enabled = ApplicationState.instance.showAxis;
	__zAxis.renderer.enabled = ApplicationState.instance.showAxis;	

	    // 
		// if (ApplicationState.instance.showAxis) {
		// 	//__xAxis.active = false;
		// 	//__yAxis.active = false;
		// 	//__zAxis.active = false;
		// 	renderShowTexture = false;
		// 	__xAxis
		// } else {
		// 	//__xAxis.active = true;
		// 	//__yAxis.active = true;
		// 	//__zAxis.active = true;		
		// }
		
}