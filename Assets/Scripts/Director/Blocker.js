

import ApplicationState;
import WindowManager;


// objects to avoid

enum CharacterActions {
	Stand,
	Sit,
	Kneel,
	Lay,
	Inaction
}


private var __destinations : Array;
private var __ray : Ray;
private var __colliders : Array;
private var __characterColliders : Array;
private var __closestHit : RaycastHit;
private var __addingDestinations : boolean;
private var __startTime : float;
private var __blocking : boolean;
// live drawing
// private var __textureSize : int = 2048;
// private var __blankPixels : Color[] = new Color[__textureSize*__textureSize];
// private var __currentProjector : Projector;
// private var __tex : Texture2D;
// private var __xMax : float;
// private var __zMax : float;
// private var __xMin : float;
// private var __zMin : float;
private var __prevPos : Vector2;
private var __noPos : Vector2 = Vector2(Mathf.Infinity,0);;
// private var __projectorMaterial : Material;
private var __pathPainter : PathPainter;
private var __previousMouseCoords : Vector2;

function FinishInitialization() {
	// var sceneColliders : Array = GameObject.FindObjectsOfType(Collider);
	__blocking = false;
	__colliders = new Array();
	__characterColliders = new Array();
	__addingDestinations = false;
	__setStartTime = true;
	finishCharacterMovement();
	var stages : Array = GameObject.FindGameObjectsWithTag("Stage");		
	// live drawing
	__pathPainter = GameObject.Find("Director").GetComponent(PathPainter);
	// __noPos = Vector2(Mathf.Infinity,0);
	__prevPos = __noPos;

	var sceneColliders : Array = GameObject.FindObjectsOfType(Collider);
	for (var thisCollider : Collider in sceneColliders) {
		// Debug.Log(thisCollider.gameObject.tag);
		if (thisCollider.gameObject.tag == "Stage") {
			__colliders.Push(thisCollider);
		}
	}
	
	for (var key : String in ApplicationState.instance.playStructure["characters"].Keys()) {
		addToCharacterColliders(ApplicationState.instance.playStructure["characters"][key]["gameObject"].GetComponent("CharacterController"));		
	}
			
	// }	
}
 
function Awake() {
	__destinations = new Array();
	__previousMouseCoords = Vector2(Mathf.Infinity, Mathf.Infinity);
}

private function canBlock(mouseCoords : Vector2) {
	
	// check if hit is on character, if so 
	var shortestDistance :float = Mathf.Infinity;
	var currentDistance : float = shortestDistance;
	var hit : RaycastHit;
	__ray = Camera.main.ScreenPointToRay(mouseCoords);	
	var closestCollider : Collider;
	// check against character colliders
	for (var collider : Collider in __characterColliders) {
		if (collider.Raycast(__ray, hit, shortestDistance)) {
			currentDistance = Vector3.Distance (hit.point , transform.position);
			if ( currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
				closestCollider = collider;
			}
		}
	}
	// check against stage colliders
	for (var collider : Collider in __colliders) {
		if (collider.Raycast(__ray, hit, shortestDistance)) {
			currentDistance = Vector3.Distance (hit.point , transform.position);
			if ( currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
				closestCollider = collider;
			}
		}
	}	
	
	// if collider belongs to a character set selected and return false
	
	if (closestCollider.gameObject.tag == "Character") {
		ApplicationState.instance.selectedCharacter = closestCollider.gameObject;
		return false;
	}
	
	return 	ApplicationState.instance.selectedCharacter && 
			ApplicationState.instance.currentMouseCameraState == MouseCameraControlState.NONE &&
			ApplicationState.instance.scrubberDraged == false &&
			ApplicationState.instance.floatingCamera == true;
			//WindowManager. check if hit was on interface
}

function addToCharacterColliders(collider : Collider) {
	__characterColliders.Push(collider);
}

// function addToColliders(collider : Collider) {
// 	__colliders.Push(collider);
// }

function Update() {
	var mouseCoords : Vector2; 
	if (Input.GetMouseButtonDown(0)) { 
		
		mouseCoords	= Input.mousePosition;
		if (canBlock(mouseCoords) && !isHitOnInterface(mouseCoords)) {
			__blocking = true;
		}
	}

	if (__blocking && Input.GetMouseButtonUp(0)) {
		__blocking = false;
	}

	if (__blocking) {
		mouseCoords	= Input.mousePosition;				
		
		if (Vector2.Distance(__previousMouseCoords, mouseCoords) > 5) {
			__previousMouseCoords = mouseCoords;
			
			__ray = Camera.main.ScreenPointToRay(mouseCoords);
			var shortestDistance :float = Mathf.Infinity;
			var currentDistance : float = shortestDistance;		
			var __hit : RaycastHit;
			var character : GameObject = ApplicationState.instance.selectedCharacter;				
			
			for (var collider : Collider in __colliders) {
				// Debug.Log("testing collider");
				if (collider.Raycast(__ray, __hit, shortestDistance)) {
					currentDistance = Vector3.Distance (__hit.point , transform.position);
					if ( currentDistance < shortestDistance ) {
						shortestDistance = currentDistance;
						__closestHit = __hit;
					} 
		
		    		Debug.DrawLine (__ray.origin, __closestHit.point);
					
					// draw live on texture
					
					if (__addingDestinations == false) {
						__startTime = ApplicationState.instance.playTime;
						// erase path until __startTime if there was a path before set __prev pos to that pos
						//__pathPainter.startNewPath();
						// XXX also return __latestDirection
						// XXX fix to figure out if prevPos is correct
						var result : Hashtable = __pathPainter.redrawUntil(ApplicationState.instance.selectedCharacter.name, __startTime);
						__prevPos = result["pos"];
						__pathPainter.startNewPath(result["latestDirection"]);
						ApplicationState.instance.movingCharacterKey = character.name;
					}
					
					__destinations.Push(__closestHit.point);
					__addingDestinations = true;
					
					// draw position
					var currentPos : Vector2 = Vector2(__closestHit.point.x, __closestHit.point.z);
					if (__prevPos != __noPos) {
						character.transform.position = __closestHit.point;						
						var currentColor : Color =  ApplicationState.instance.playStructure["characters"][character.name]["color"];
						// __pathPainter.drawStop(currentPos.x, currentPos.y, currentColor);
						__pathPainter.rasterPathWithDirection(__prevPos.x, __prevPos.y, currentPos.x, currentPos.y, currentColor);
						__pathPainter.applyChanges();
					
					}
					__prevPos = currentPos;
				}
			}
		} 
	}

	
	
	
	
	
	
	if (__addingDestinations && ApplicationState.instance.scrubberDraged) {
		__addOnNextMouseUp = true;
	}
	
	
	if (__addOnNextMouseUp && Input.GetMouseButtonUp(0)) {
		finishCharacterMovement();
	}
}

function finishCharacterMovement() {
	__previousMouseCoords = Vector2(Mathf.Infinity, Mathf.Infinity);
	if (__startTime > ApplicationState.instance.playTime) {
		__startTime = ApplicationState.instance.playTime;
	}
	
	var thisDelta = (ApplicationState.instance.playTime - __startTime)/ __destinations.length;
	var thisTime = __startTime;
	// Debug.Log();
	for (var destination : Vector3 in __destinations) {
		// add the destinations to selected character
		addDestinationCurrentCharacter(destination, 
			 							   thisTime, 
			  							   true, 
			  							   true);
		thisTime += thisDelta;			
	}
	
	__addingDestinations = false;
	__destinations.Clear();
	ApplicationState.instance.movingCharacterKey = "";
	__prevPos = __noPos;
	__addOnNextMouseUp = false;
}

public function addDestinationCurrentCharacter(destination : Vector3, 
											   currentTime : float, 
											   doRemoval : boolean, 
											   addMarker : boolean) 
{
	
	// before calling this function we have to make sure the ApplicationState.instance.selectedCharacter.tag
	// is not a CharacterCam 
	
	// find act scene
	var newDestination : Hashtable = Hashtable();
	
	newDestination["endTime"] = currentTime;
	newDestination["position"] = destination;
 	//    if(addMarker) {
 	// 	newDestination["marker"] = createCharacterMarker(destination, ApplicationState.instance.playStructure["characters"][ApplicationState.instance.selectedCharacter.name]["color"]);
 	// 	__positionMarkerToDestination[newDestination["marker"].name] = newDestination;
 	// }
    
	var currentScene : Hashtable = ApplicationState.instance.getSceneAt(currentTime);
	
	var i : int;
	if (doRemoval) {
		// check scene if it has some other destination at the same time
		for (i = 0; i < currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length; i++) {
			
			if ( currentScene["destinations"][ApplicationState.instance.selectedCharacter.name][i]["endTime"] == currentTime) {
				currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].RemoveAt(i);
				--i;
			}
		}
	}
		
	// add in correct place
	
	for ( i  = 0; i < currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length; i++) {
		if ( currentScene["destinations"][ApplicationState.instance.selectedCharacter.name][i]["endTime"] > currentTime ) {
			break;	
		}	
	}
	
	if (i==0) {
		currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].clear();	
	} else {
		currentScene["destinations"][ApplicationState.instance.selectedCharacter.name] =
			currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].slice(0,i);
	}
	
	if (currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length) {
		//newDestination["previous"] = currentScene["destinations"][ApplicationState.instance.selectedCharacter.name][currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length-1];
		currentScene["destinations"][ApplicationState.instance.selectedCharacter.name][currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length-1]["next"] = newDestination;
	} 
	newDestination["next"] = null;

	currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].Push(newDestination);
						 
	ApplicationState.instance.redrawSurfacePaths = true;	
	// TODO check if this is necesary or should we add a control on the ApplicationState
	// __onStageWindowControl.createPresenceActionBars(Array(ApplicationState.instance.selectedCharacter.name));
}

function isHitOnInterface(mouseCoords : Vector2) {
	
	for (var i:int =0; i < WindowManager.instance.LAST_ID; i++) {
		if (WindowManager.isWindowClicked(mouseCoords, WindowManager.instance.windowRects[i])) {
			return true;
		}
	}
	
	for (var characterKey in WindowManager.instance.lineRects.Keys) {
		if (WindowManager.isWindowClicked(mouseCoords, WindowManager.instance.lineRects[characterKey])) {
			return true;
		}
	}
	
	return false;
}


public function addActionCurrentCharacterNow(type : CharacterActions)
{
	addActionCurrentCharacter(ApplicationState.instance.playTime, type);
}

public function addActionCurrentCharacter(currentTime : float, type : CharacterActions)
{
	if (ApplicationState.instance.selectedCharacter != null) {
		var currentScene : Hashtable = ApplicationState.instance.getSceneAt(currentTime);
		var newAction : Hashtable = Hashtable();
		newAction["endTime"] = currentTime;
		newAction["type"] = type;
	
		// create array if does exist
		var characterName : String = ApplicationState.instance.selectedCharacter.name;
		if (! currentScene["actions"][ApplicationState.instance.selectedCharacter.name]) {
			currentScene["actions"][ApplicationState.instance.selectedCharacter.name] = Array();
			// add standing since it is the default begginging position
			
			var defaultStartingAction : Hashtable = Hashtable();
			defaultStartingAction["endTime"] = 0.0; // modify to scene start
			defaultStartingAction["type"] = CharacterActions.Stand;
			currentScene["actions"][ApplicationState.instance.selectedCharacter.name].Push(defaultStartingAction);
		}
		
		// add in correct place
		var characterActions : Array = currentScene["actions"][ApplicationState.instance.selectedCharacter.name];
		
		for (var i:int = 0; i < characterActions.length; i++) {			
			if (currentTime <= characterActions[i]["endTime"]) {
				break;
			}
		}
		
		if (i < characterActions.length && currentTime == characterActions[i]["endTime"]) {
			characterActions[i]["type"] = type;
		} else {
			currentScene["actions"][ApplicationState.instance.selectedCharacter.name].splice(i,0,newAction);
		}
		//currentScene["actions"][ApplicationState.instance.selectedCharacter.name].Push(newAction);
	}
	
	
	
	// for ( i  = 0; i < currentScene["actions"][characterName].length; i++) {
	// 	if ( currentScene["actions"][characterName][i]["time"] > currentTime ) {
	// 		break;	
	// 	}	
	// }
	// 
	// currentScene["actions"][characterName] = currentScene["actions"][characterName].slice(0,i);
	// 
	// if (currentScene["actions"][characterName].length) {
	// 	//newDestination["previous"] = currentScene["destinations"][ApplicationState.instance.selectedCharacter.name][currentScene["destinations"][ApplicationState.instance.selectedCharacter.name].length-1];
	// 	currentScene["actions"][characterName][currentScene["actions"][characterName].length-1]["next"] = newAction;
	// }
	// 
	//currentScene["actions"][ApplicationState.instance.selectedCharacter.name].Push(newAction);
	
	
}

