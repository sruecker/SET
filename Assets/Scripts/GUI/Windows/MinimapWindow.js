/*
import WindowManager;


class MinimapWindow extends ToolTipSender {

public var gSkin : GUISkin;
public var emptyGuiSkin : GUISkin;

public var yStart : int = 12;
public var mapTexture : Texture2D;
public var camPosTexture : Texture2D;
public var presetOffTexture : Texture2D;
public var presetOnTexture : Texture2D;
public var addLocationTexture : Texture2D;
public var removeLocationTexture : Texture2D;

public var minimapStyle : GUIStyle;

private var __cameraManager : ManageCameras;
private var __mesh : Mesh;
private var __camPosX : int;
private var __camPosY : int;
private var __camRotation : Vector3;
//private var __currentView : String;
private var __monitorCameraIndex : int;
private var __cachedCameraPos : Vector3;
private var __mapPositions : Hashtable;
private var __lowerMenuHeight : int = 25;
private var __lowerButtonSize : int = 16;//12;
private var __noCamera : String = "¿#N0N_CaMERA^^!";

function Awake()
{
	__cameraManager = GameObject.Find("Director").GetComponent(ManageCameras);	
	__camPosX = 10;
	__camPosY = 10;
	__camRotation = new Vector3(0, 0);
	ApplicationState.instance.currentSelectedView = __noCamera;
	__monitorCameraIndex = -1;
	__cachedCameraPos = Vector3.zero;
	__mapPositions = new Hashtable();

}

function OnGUI() {
	
    // Register the window. Notice the 3rd parameter	
	GUI.skin = emptyGuiSkin;
if (false)	{
	if (WindowManager.instance.showMiniMap) {
		WindowManager.instance.windowRects[WindowManager.instance.MINIMAP_ID] = 
			GUI.Window (WindowManager.instance.MINIMAP_ID, 
						WindowManager.instance.windowRects[WindowManager.instance.MINIMAP_ID], 
						DoMinimapWindow, 
						"",
						minimapStyle);
	}
}

}

// Make the contents of the window
function DoMinimapWindow (windowID : int) {

	GUI.skin = emptyGuiSkin;
	
	GUI.DrawTexture(Rect(0, 0, mapTexture.width, mapTexture.height), mapTexture);
	
	var matrixBackup : Matrix4x4 = GUI.matrix;
	GUIUtility.RotateAroundPivot(
		__camRotation.y, 
		Vector2(__camPosX + Mathf.RoundToInt(camPosTexture.width / 2), __camPosY + Mathf.RoundToInt(camPosTexture.width / 2))
	);
	GUI.DrawTexture(Rect(__camPosX, __camPosY, camPosTexture.width, camPosTexture.height), camPosTexture);
	GUI.matrix = matrixBackup;
	
	if (ApplicationState.instance.playStructure["views"].Count != __mapPositions.Count) CacheMapPositions();
	
	for (var view in ApplicationState.instance.playStructure["views"]) {
		var buttonTexture:Texture2D;
		
		if (ApplicationState.instance.currentSelectedView != __noCamera && ApplicationState.instance.currentSelectedView == view.Key) {
			buttonTexture = presetOnTexture;
		} else buttonTexture = presetOffTexture;
		
		var viewVec : Vector3 = view.Value["location"];
		var mapVec : Vector2 = __mapPositions[view.Key];
		
		if (GUI.Button(Rect(mapVec.x, mapVec.y, presetOffTexture.width, presetOffTexture.height), GUIContent(buttonTexture, view.Key))) {
			if (__cameraManager.getActiveCamIndex() == 0) {
				__cameraManager.setActiveCamPosition(viewVec);
				__cameraManager.setActiveCamLookAt(view.Value["lookAt"]);
				ApplicationState.instance.currentSelectedView = view.Key;
				__monitorCameraIndex = __cameraManager.getActiveCamIndex();
				__cachedCameraPos = __cameraManager.getActiveCamPosition();
			}
		}
	}
	
	// lower controls
	GUI.BeginGroup(Rect(0, mapTexture.height - 1 , mapTexture.width, __lowerMenuHeight));
	GUILayout.BeginHorizontal();
	
	//var views : Hashtable = ApplicationState.instance.playStructure["views"];
	if (ApplicationState.instance.currentSelectedView != __noCamera) {
		var view : Hashtable = ApplicationState.instance.playStructure["views"][ApplicationState.instance.currentSelectedView];
		view["name"] = GUILayout.TextField(view["name"], 22);
	} else {
		//GUILayout.TextField("", 22);
		GUILayout.FlexibleSpace();
	}
	
	var buttonSpacing : int = 8;
	
	if(GUILayout.Button(GUIContent(addLocationTexture, "Add position"), GUILayout.Width(__lowerButtonSize))) {
		DoViewAdded();
	}
	GUILayout.Space(buttonSpacing);
	
	if(GUILayout.Button(GUIContent(removeLocationTexture, "Remove position"), GUILayout.Width(__lowerButtonSize)  )) {
		DoViewRemoved();
	}
	GUILayout.Space(buttonSpacing);

	GUILayout.EndHorizontal();
	GUI.EndGroup();
	
	UpdateToolTip();
	
    GUI.DragWindow();
}

private function DoViewAdded() {
	var newView : Hashtable = new Hashtable();
	newView["location"] = __cameraManager.getActiveCamPosition();
	newView["lookAt"] = __cameraManager.getActiveCamLookAt();
	
	// TODO make sure view name is valid XML text
	
	var newEntry : String = "View " + ApplicationState.instance.playStructure["views"].Count;
	newView["name"] = newEntry;
	ApplicationState.instance.playStructure["views"][newEntry] = newView;
	ApplicationState.instance.currentSelectedView = newEntry;

}

private function DoViewRemoved() {
	
	var viewsHash : Hashtable = ApplicationState.instance.playStructure["views"];
	
	if (viewsHash.Contains(ApplicationState.instance.currentSelectedView)) {
		viewsHash.Remove(ApplicationState.instance.currentSelectedView);
	}
}

// takes a Vector3 from within the stage bounds and translates it to a Vector2 in the minimap
private function VectorToMap(posVector:Vector3, rotVector:Vector3, texture:Texture2D):Vector2
{
	var xAdjust:float = Mathf.RoundToInt(texture.width / 2);
	var yAdjust:float = Mathf.RoundToInt(texture.height / 2);


	var posX : float = posVector.x - __mesh.bounds.min.x;
	var posZ : float = -posVector.z + __mesh.bounds.max.z - 7;
	var diffX : float = mapTexture.width / __mesh.bounds.size.x;
	var diffZ : float = mapTexture.height / __mesh.bounds.size.z + 1;
	var mapPos:Vector2 = new Vector2(Mathf.RoundToInt(posX * diffX) - xAdjust, Mathf.RoundToInt(posZ * diffZ) - yAdjust);
	return mapPos;
}

function LateUpdate()
{
	var camPos:Vector3 = __cameraManager.getActiveCamPosition();
	__camRotation = __cameraManager.getActiveCamRotation();
	var mapPos:Vector2 = VectorToMap(camPos, __camRotation, camPosTexture);
	__camPosX = mapPos.x;
	__camPosY = mapPos.y;
	
	if (__monitorCameraIndex != -1) {
		if ((__monitorCameraIndex == 0 && camPos != __cachedCameraPos) ||
			(__monitorCameraIndex == 1 && (camPos.x != __cachedCameraPos.x || camPos.z != __cachedCameraPos.z))) {
			__monitorCameraIndex = -1;
			ApplicationState.instance.currentSelectedView = __noCamera;
			__cachedCameraPos = Vector3.zero;
		}
	}
}

public function FinishInitialization()
{
	var stage:GameObject = GameObject.FindWithTag("StageBoundry");

	__mesh = stage.GetComponent(MeshFilter).mesh;
	
	// set mapTexture based on model selection
	
	var textureToLoad : String = "Textures/Minimap/" + ApplicationState.instance.playStructure["stage"];
	
	mapTexture = Instantiate(Resources.Load(textureToLoad)) as Texture;
	
	WindowManager.instance.windowRects[WindowManager.instance.MINIMAP_ID].width = mapTexture.width;
	WindowManager.instance.windowRects[WindowManager.instance.MINIMAP_ID].height = mapTexture.height + __lowerMenuHeight;
	
}

private function CacheMapPositions() {
	__mapPositions = new Hashtable();
	for (var view in ApplicationState.instance.playStructure["views"]) {
		var mapVec : Vector2 = VectorToMap(view.Value["location"], Vector3.zero, presetOffTexture);
		__mapPositions.Add(view.Key, mapVec);
	}
}



}
*/