

static var instance : ApplicationState;
 
static var playStructure : Hashtable;
static var animate : boolean; 
static var playTime : float;
static var playTimeLength : float;
static var playSpeed : float;
static var moveCamera : boolean = false;
static var redrawSurfacePaths : boolean = false;
static var speechChanged : boolean = false;
static var playingForward : boolean = true;
static var scrubberDraged : boolean = false;
static var useMouseLook : boolean = true;
static var playTimeUpdated : boolean = false;
static var selectedCharacter : GameObject = null;
static var wordTimeLength : float = 0.3;
static var playToLoad : String;
static var currentToolTip : String;
static var initialCameraPosition : Vector3;
static var initialCameraRotation : Vector3;
static var delayForTooltip : float = 0.7;
static var currentSelectedView : String;
static var editCharacterPaths : boolean;
static var floatingCamera : boolean;
static var holdingSelectedCharacter : boolean;
static var newDestinationSelectedCharacter : boolean;
static var sideLabels : boolean;
static var showAxis : boolean;
static var showAnnotationImages : boolean;
static var showOnScreenTextAnnotations : boolean;
static var showOnScreenImageAnnotations : boolean;
static var movingCharacterKey : String;
static var loadingNewFile : boolean;
static var addAnnotation : boolean;

var characterMug : Texture2D;
var speechBubbleTexture : Texture2D;
var characterControlsTexture: Texture2D;

private var __directorObject : GameObject;
private var __timeLineObject : GameObject;
private var __speechesObject : GameObject;
private var __annotationsObject : GameObject;
private var __annotationsImagesObject : GameObject;
private var __onStageObject : GameObject;
private var __minimapObject : GameObject;
private var __messengerObject : GameObject;
private var __realTimeMapWindow : GameObject;

private var __previousTime : float = 0;

private var __fileManagerComponent : FileManager;

var currentAct : Hashtable;
var currentScene : Hashtable;

static var INDEX_NOT_FOUND : int = -1;
enum MouseCameraControlState { NONE, ZOOM, TRACK, TUMBLE };
static var currentMouseCameraState : MouseCameraControlState = MouseCameraControlState.NONE;

 
 // movement variables

/* A Movement.Translation defines a movement from the previous position to the next. A Movement.Jump will 
 * change the position of the object immeadeately. To make the objects disappear a Movement.Jump
 * movement can be set to the DISAPPEAR_POS.
 */
 

enum Movement
{
	Translation,
	Jump
}

static var DISAPPEAR_POS : Vector3 = Vector3(-1000000, -1000000, -1000000);

// line variables
 
 
// This is where the magic happens.

instance = FindObjectOfType(ApplicationState);

if (instance == null) {
    Debug.Log ("Could not locate an ApplicationState object. You have to have exactly one ApplicationState in the play.");
}



 // Ensure that the instance is destroyed when the game is stopped in the editor.
function OnApplicationQuit() 
{
    instance = null;
}


function getPlay() : Hashtable 
{	
	return playStructure;	
}

function InitValues() {
	animate = false;
	playTime = 0;
	playSpeed = 1.0;
	currentToolTip = "";
	editCharacterPaths = false;
	holdingSelectedCharacter = false;
	newDestinationSelectedCharacter = false;
	sideLabels = true;
	showAxis = true;
	showAnnotationImages = true;
	showOnScreenTextAnnotations = true;
	showOnScreenImageAnnotations = true;
	__previousTime = 0;
	selectedCharacter = null;
	addAnnotation = false;// for testing purposes
}

function Awake()
{
	
	loaded = false;
	playTimeLength = 0;	
	loadingNewFile = false;
	playStructure = new Hashtable();
	InitValues();
	__directorObject = GameObject.Find("Director");	
	__timeLineObject = GameObject.Find("TimeLine");
	__speechesObject = GameObject.Find("SpeechesWindow");
	__annotationsObject = GameObject.Find("AnnotationsWindow");
	__annotationsImagesObject = GameObject.Find("AnnotationTexturesWindow");
	__onStageObject = GameObject.Find("OnStageWindow");
	// __minimapObject = GameObject.Find("MinimapWindow");
	__realTimeMapWindow = GameObject.Find("RealTimeMapWindow");
	__messengerObject = GameObject.Find("Messenger");
	__minimapObject = GameObject.Find("MinimapWindow");
	__fileManagerComponent = GameObject.Find("States").GetComponent(FileManager);
}

function loadPlayFile(filename:String)
{
	ApplicationState.instance.playStructure = __fileManagerComponent.loadSceneFile(filename);
}

function savePlayFile(filename:String)
{
	__fileManagerComponent.saveApplicationState(filename);	
}

function showMessage(title: String, msg:String) {
	__messengerObject.GetComponent(Messenger).title = title;
	__messengerObject.GetComponent(Messenger).message = msg;
    __messengerObject.GetComponent(Messenger).msgType = __messengerObject.GetComponent(Messenger).SHOW;
	__messengerObject.GetComponent(Messenger).visible = true;
}

function showConfirm(title: String, msg:String, callback:Function) {
	__messengerObject.GetComponent(Messenger).title = title;
	__messengerObject.GetComponent(Messenger).message = msg;
    __messengerObject.GetComponent(Messenger).msgType = __messengerObject.GetComponent(Messenger).CONFIRM;
    __messengerObject.GetComponent(Messenger).callback = callback;
	__messengerObject.GetComponent(Messenger).visible = true;
}

function Start()
{
	DontDestroyOnLoad(GameObject.Find("Director"));
	DontDestroyOnLoad(GameObject.Find("States"));
	DontDestroyOnLoad(GameObject.Find("UI"));
	if (playToLoad != null) {		
		loadPlay(playToLoad);
	} else loadPlay(null);
	
}

// function setPlayToLoad(filename:String) {
// 	loadPlay(filename);
// 	
// }


function loadPlay(filename:String) {
	// setPlayToLoad( filename );
	ApplicationState.instance.animate = false;
	playToLoad = filename;	
	// find what stage to load 
	ApplicationState.instance.loadingNewFile = true;
	InitValues();
	
	loadPlayFile(ApplicationState.instance.playToLoad);
	playTime = 0;
	
	
	// reset values
	
	// ApplicationState.instance.playTime = 0;
	GameObject.Find("Director").GetComponent(NewCameraControls).SetPointer();
	// load that stage
	Application.LoadLevel(ApplicationState.instance.playStructure["stage"]);
		
}

function completeLoadPlay()
{
	
	setupPlay();		
	InitValues();
	__directorObject.GetComponent(PathPainter).FinishInitialization();
//	__directorObject.GetComponent(Blocker).FinishInitialization();
//	__timeLineObject.GetComponent(TimeLineView).FinishInitialization();
	__directorObject.GetComponent(ManageCameras).FinishInitialization();
	__speechesObject.GetComponent(SpeechesWindowControl).FinishInitialization();
	__annotationsObject.GetComponent(AnnotationsWindowControl).FinishInitialization();
	__annotationsImagesObject.GetComponent(AnnotationTexturesControl).FinishInitialization();
	__onStageObject.GetComponent(OnStageWindowControl).FinishInitialization();
	GameObject.Find("TimeLineWindow").GetComponent(TimeLineWindowControl).FinishInitialization();
	GameObject.Find("Toolbar").GetComponent(Toolbar).FinishInitialization();
	GameObject.Find("Main Camera").GetComponent(Blocker).FinishInitialization();
	// __minimapObject.GetComponent(MinimapWindow).FinishInitialization();
	__realTimeMapWindow.GetComponent(RealTimeMapWindow).FinishInitialization();
	GameObject.Find("CameraControlsWindow").GetComponent(CameraControlsWindow).FinishInitialization();
	GameObject.Find("AddAnnotationWindow").GetComponent(AddAnnotationWindow).FinishInitialization();
	WindowManager.instance.cacheWindows();
}



/*
function Start()
{
		

	
	loadPlayFile();
	setupPlay();
	
	__directorObject.GetComponent(PathPainter).FinishInitialization();
	//__directorObject.GetComponent(Blocker).FinishInitialization();
	__directorObject.GetComponent(ManageCameras).FinishInitialization();
	__speechesObject.GetComponent(SpeechesWindowControl).FinishInitialization();
	__annotationsObject.GetComponent(AnnotationsWindowControl).FinishInitialization();
	__onStageObject.GetComponent(OnStageWindowControl).FinishInitialization();
	GameObject.Find("TimeLineWindow").GetComponent(TimeLineWindowControl).FinishInitialization();
	GameObject.Find("Main Camera").GetComponent(Blocker).FinishInitialization();
	GameObject.Find("MinimapWindow").GetComponent(MinimapWindow).FinishInitialization();


}
*/


function setupPlay()
{
	// check which stage to set according 

	// var prefabStage : GameObject =  Instantiate(Resources.Load( "Prefabs/Stages/" + playStructure["stage"] + "Prefab" )) as GameObject;
	
	// prefabStage.tag = "Stage";
	
	var prefabSet : GameObject;
	if (playStructure["set"] != null) {
		prefabSet = Instantiate(Resources.Load( "Prefabs/Sets/" + playStructure["set"] + "Prefab" )) as GameObject;
		prefabSet.tag = "Stage";
	}
	
	// set up the characters
	
	for (var characterKey in playStructure["characters"].Keys  ) {
			
		
		playStructure["characters"][characterKey]["gameObject"] = Instantiate(Resources.Load( "Prefabs/Characters/" + playStructure["characters"][characterKey]["model"] ),
									 						  DISAPPEAR_POS,
									 						  Quaternion.identity) as GameObject;
									 						  
		
		// playStructure["characters"][characterKey]["gameObject"].tag = "Character";
		
		//temp
		//playStructure["characters"][characterKey]["gameObject"].transform.Rotate(Vector3.up * 180 ); 
		
		
		playStructure["characters"][characterKey]["gameObject"].name = characterKey;
		
		playStructure["characters"][characterKey]["gameObject"].GetComponent(CharacterModelColor).setBodyColor( playStructure["characters"][characterKey]["color"]  );
		
		//playStructure["characters"][characterKey]["characterPicture"] = 
		
	}
	
	ApplicationState.instance.currentAct = ApplicationState.instance.playStructure["acts"][0];
	ApplicationState.instance.currentScene = ApplicationState.instance.playStructure["scenes"][0];
}



function getActAt( time : float )
{
	return getValueAtTime("acts", playStructure, time);

}

function getSceneAt( time : float )
{
	return getValueAtTime("scenes", playStructure, time);

}


function getSceneIndexAt( time : float)
{
	return getValueIndexAtTime("scenes", playStructure, time);
}

private function getValueAtTime(key : String, slot : Hashtable, currentTime : float)
{	
	var result : int = getValueIndexAtTime(key, slot, currentTime);
	if (result == INDEX_NOT_FOUND) return null;
	return slot[key][result];	
}

private function getValueIndexAtTime(key : String, slot : Hashtable, time : float) : int
{

	for (var i : int = 0; i < slot[key].length; i++) {
		if (slot[key][i]["endTime"] > time && 
			( i == 0 || slot[key][i-1]["endTime"] <= time) ) {
			
			return i;	
		}
	}
	
	return INDEX_NOT_FOUND;	
}
 
static function getLineTime(text : String, pace : float )
{
	var words : Array = text.Split(" "[0]);
	return pace * wordTimeLength * words.length;

}


function getColoredCharacterControlsBackground(characterColor) : Texture2D
{
	var tex : Texture2D = Instantiate(characterControlsTexture);
		
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {
			var newColor : Color = tex.GetPixel(i,j);			
			if (newColor.r < 0.4){					
				newColor = Color(1.0-newColor.r,
							  	 1.0-newColor.g,
								 1.0-newColor.b) * characterColor;			
			}
			tex.SetPixel(i, j, newColor);
		}
	}
	tex.Apply();
	
	return tex;
}

function getColoredSpeechBubble(characterColor : Color) :Texture2D
{
	var tex : Texture2D = Instantiate(speechBubbleTexture);
		
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {
			var newColor : Color = tex.GetPixel(i,j);			
			if (newColor.r < 0.4){					
				newColor = Color(1.0-newColor.r,
							  	 1.0-newColor.g,
								 1.0-newColor.b) * characterColor;			
			}
			tex.SetPixel(i, j, newColor);
		}
	}
	tex.Apply();
	
	return tex;
}

function getColoredMug(characterColor : Color) : Texture2D
{
	
	var tex : Texture2D = Instantiate(characterMug);
	
	for (var i : int = 0 ; i < tex.width; i++) {
		for (var j : int = 0 ; j < tex.height; j++) {
			var newColor : Color = tex.GetPixel(i,j);
			
			if(newColor.a > 0) {
				newColor *= characterColor;
			}
			tex.SetPixel(i, j, newColor);
		}
	}
	tex.Apply();
	
	return tex;
	

}

