


var xOffset = -160;
var yOffset = 40;
var guiSkin : GUISkin;
var lineBoxWidth: int = 200;
var contentPadding : int = 8;
var lineBoxStyle : GUIStyle;
var gravity = -0.2;
var headerBackgroundImage : Texture2D;
var minSpeechBubbleHeight : int = 55;

// temp
private var __oldScene : Hashtable = null;
private var __newScene : boolean = true;

// private var __soundEmitter : GameObject;
var soundStyle : GUIStyle;
private var renderStaticSound : boolean;


private static var INDEX_NOT_FOUND : int = -1;

function Awake() {
	// __soundEmitter = GameObject.Find("SoundEmitterPrefab");
	renderStaticSound = false;
}


function Update()
{
	if (ApplicationState.instance.playStructure["characters"] && 
		ApplicationState.instance.playStructure["acts"]) {
		
		var currentTime : float = ApplicationState.instance.playTime;
		
		// get current slots
		ApplicationState.instance.currentAct = getValueAtTime("acts", ApplicationState.instance.playStructure, currentTime);
		ApplicationState.instance.currentScene = getValueAtTime("scenes", ApplicationState.instance.playStructure, currentTime);


		// temp
		if (__oldScene != ApplicationState.instance.currentScene) {
			__newScene = true;
			__oldScene = ApplicationState.instance.currentScene;	
		} else {
			__newScene = false;	
		}
		
		// set lines
	
		
		for (var currentChar in ApplicationState.instance.playStructure["characters"].Keys) {
			ApplicationState.instance.playStructure["characters"][currentChar]["hasLines"] = false;
			ApplicationState.instance.playStructure["characters"][currentChar]["currentLines"].Clear();
		}
		
		for (var line in ApplicationState.instance.currentScene["lines"]) {
			var endTime : float = line["startTime"] + ApplicationState.getLineTime(line["text"], line["pace"]);
			
			if (line["startTime"] < currentTime && endTime >= currentTime ) {
				ApplicationState.instance.playStructure["characters"][line["character"]]["hasLines"] = true;
				ApplicationState.instance.playStructure["characters"][line["character"]]["currentLines"].Push(line["text"]);
					
			}
		}
		
				
		// set destinations
		
		var destinations : Hashtable = ApplicationState.instance.currentScene["destinations"];
		//var actions : Hashtable = ApplicationState.instance.currentScene["actions"];
		
		for (var charachterKey in ApplicationState.instance.playStructure["characters"].Keys) {
			if (charachterKey != ApplicationState.instance.movingCharacterKey) {
				if ( ! ((ApplicationState.instance.holdingSelectedCharacter || ApplicationState.instance.newDestinationSelectedCharacter) && 
						ApplicationState.instance.selectedCharacter.name == charachterKey)) {
			
					var currentDestinationIndex : int = getValueIndexAtTime(charachterKey, destinations, currentTime);
				
					// make sure the character objects have been loaded
					if (ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]) {
						// for destinations
						if (currentDestinationIndex != INDEX_NOT_FOUND) {
				
				
						// var verticalSpeed = 0;//-1.0 * gravity * Time.deltaTime;
						// 				var movement : Vector3 = Vector3 (0, verticalSpeed, 0);
						// 				if (ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"].tag == "SoundEmitter") {
						// 					movement.y = 0;
						// 				}
						
						// ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]
						// var controller : CharacterController = ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"].GetComponent(CharacterController);
							
				
						var prevPosDisappear : boolean = (currentDestinationIndex > 0 && destinations[charachterKey][currentDestinationIndex - 1]["position"] == ApplicationState.instance.DISAPPEAR_POS);
						var nextPosDisappear : boolean = destinations[charachterKey][currentDestinationIndex]["position"] == ApplicationState.instance.DISAPPEAR_POS;

				
						// if (true || __newScene || 
						// 						ApplicationState.instance.scrubberDraged == true ||
						// 						ApplicationState.instance.playTimeUpdated == true ||
						// 						nextPosDisappear ||
						// 						prevPosDisappear ) { 
				
							var timeToUse : float = currentTime;
										
							if (prevPosDisappear && destinations[charachterKey][currentDestinationIndex]["endTime"] > currentTime) {
								//currentDestinationIndex = currentDestinationIndex-1;
								timeToUse = destinations[charachterKey][currentDestinationIndex-1]["endTime"];
							}

							appearInDestination(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"],
											   currentDestinationIndex,
											   destinations[charachterKey],
											   timeToUse);
							//if (currentDestinationIndex == 0 || destinations[charachterKey][currentDestinationIndex]["position"] != destinations[charachterKey][currentDestinationIndex-1]["position"])
				
						
							// if ((currentDestinationIndex == 0 && destinations[charachterKey].length) || 
							// 							(currentDestinationIndex < destinations[charachterKey].length && destinations[charachterKey][currentDestinationIndex]["position"] != destinations[charachterKey][currentDestinationIndex+1]["position"])) {
							// 								
							// 								rotateCharacterInstantly(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"],
							// 								  				 	destinations[charachterKey][currentDestinationIndex+1]["position"]);
							// 						}
							//if ((currentDestinationIndex == 0) || (currentDestinationIndex < destinations[charachterKey].length
							//	 && destinations[charachterKey][currentDestinationIndex]["position"] != destinations[charachterKey][currentDestinationIndex+1]["position"])) {
						
							if (destinations[charachterKey].length > 1) {
						
								var newIndex : int = currentDestinationIndex;
								
								while (newIndex < destinations[charachterKey].length && 
									destinations[charachterKey][currentDestinationIndex]["position"] == destinations[charachterKey][newIndex]["position"]) {
										++newIndex;
								}
								if (newIndex < destinations[charachterKey].length){
									rotateCharacterInstantly(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"],
								  				 		destinations[charachterKey][newIndex]["position"]);
								}
							}
					

						// } 
						/*
						else { // should apply some movement				

							if (currentDestinationIndex < destinations[charachterKey].length-1 && 
								destinations[charachterKey][currentDestinationIndex]["position"] != destinations[charachterKey][currentDestinationIndex +1]["position"]
							
								) {
							
								//if (currentDestinationIndex < destinations[charachterKey].length && destinations[charachterKey][currentDestinationIndex]["position"] != destinations[charachterKey][currentDestinationIndex+1]["position"])
								rotateCharacter(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"],
								  				destinations[charachterKey][currentDestinationIndex+1]["position"],
												120);
							
							}
					
							if (!prevPosDisappear) {
													
								moveToDestination(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"],
																						  currentDestinationIndex,
																						  destinations[charachterKey],
																						  currentTime);
							}
						
						}
						*/ 	
								
				
					
								
					} else if (destinations.Contains(charachterKey)) {
						currentDestinationIndex = destinations[charachterKey].length - 1;
			
						ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"].transform.position =
							destinations[charachterKey][currentDestinationIndex]["position"];
				
					}
					}
				}
				// for actions
				// var currentActionIndex : int = getValueIndexAtTime(charachterKey, actions, currentTime);
				// 			if (currentActionIndex != INDEX_NOT_FOUND) {
				// 				
				// 				//Debug.Log(charachterKey);
				// 			//	Debug.Log(currentActionIndex);
				// 				var action : CharacterActions = actions[charachterKey][currentActionIndex]["type"];
				// 				Debug.Log(ApplicationState.instance.playTime + " " + actions[charachterKey][currentActionIndex]["endTime"]);
				// 				if (ApplicationState.instance.playTime >= actions[charachterKey][currentActionIndex]["endTime"]){
				// 					switch (action) {
				// 						case CharacterActions.Stand:
				// 							Debug.Log(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]);
				// 							Debug.Log("should stand");
				// 						break;
				// 						case CharacterActions.Sit:
				// 							Debug.Log(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]);
				// 							Debug.Log("should sit");
				// 						break;
				// 						case CharacterActions.Kneel:
				// 							Debug.Log(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]);
				// 							Debug.Log("should kneel");
				// 						break;
				// 						case CharacterActions.Lay:
				// 							Debug.Log(ApplicationState.instance.playStructure["characters"][charachterKey]["gameObject"]);
				// 							Debug.Log("should Lay");
				// 						break;
				// 					
				// 					}
				// 				}
				// 			}

			}
		}
		
		ApplicationState.instance.playTimeUpdated = false;
		
					
	}
	
	if (ApplicationState.instance.animate == true) {
			
		ApplicationState.instance.playTime += Time.deltaTime * ApplicationState.instance.playSpeed;
		
		if (ApplicationState.instance.playTime > ApplicationState.instance.playTimeLength) {	
			ApplicationState.instance.playTime = 0;


		}
	}	
	
}




private function getTargetPosition(currentDestinationIndex : int, currentTime : float, destinations : Array) : Vector3
{
	var previousIndex = currentDestinationIndex - 1;
		
	var movementTime : float = currentTime - 
							   destinations[previousIndex]["endTime"]; // how long so far
							   
	var currentDirection : Vector3 = destinations[currentDestinationIndex]["position"] -
								 destinations[previousIndex]["position"];

				 
	var totalMovementTime : float =  destinations[currentDestinationIndex]["endTime"] -
							    	 destinations[previousIndex]["endTime"];
							   
	var t : float = movementTime / totalMovementTime;
	
	currentDirection.Scale( Vector3( t, t, t ) );
	
	return (currentDirection + destinations[previousIndex]["position"]);
	

}

private function appearInDestination(characterObject : GameObject, 
							 currentDestinationIndex : int , 
							 characterDestinations : Array,
							 currentTime : float )
{
	if (characterObject) {
		if (currentDestinationIndex == 0) {
			characterObject.transform.position =
			characterDestinations[currentDestinationIndex]["position"];
		} else {
		
			characterObject.transform.position = getTargetPosition(currentDestinationIndex,
																   currentTime,
																   characterDestinations);
		
		}	
	}
	
}

private function rotateCharacterInstantly(characterObject : GameObject, 
								 		  destination : Vector3)
{
	if (characterObject.tag == "SoundEmiter") return;
	var characterModelTransform : Transform = characterObject.transform.Find("CharacterModel");
	
		
	
	var currentPosition : Vector3 = characterObject.transform.position;
	var direction : Vector3 = destination - currentPosition;
	direction.Normalize();
	var angle : float = 180;
	
	
	while (angle > 5 ) {
		var relative = characterModelTransform.InverseTransformPoint(destination);
		angle = Mathf.Atan2(relative.x, relative.z) * Mathf.Rad2Deg;
		characterModelTransform.Rotate( 0, angle, 0);
	}

}

private function rotateCharacter(characterObject : GameObject, 
								 destination: Vector3,
								 rotateSpeed : float)
{
	
	if (characterObject.tag == "SoundEmiter") return;
	var characterModelTransform : Transform = characterObject.transform.Find("CharacterModel");
	
	if (/*currentDestinationIndex != 0 && */ApplicationState.instance.animate) { 
		
	
		var currentPosition : Vector3 = characterObject.transform.position;
		var direction : Vector3 = destination - currentPosition;
		
		var angle : float = 180;

		while (angle > 5)
		{
			angle = Mathf.Abs(RotateTowardsPosition(characterModelTransform,
													destination, 
													rotateSpeed));	

			yield;
		}
		
	}
}


private function RotateTowardsPosition(characterTransform : Transform, 
									   targetPos : Vector3, 
									   rotateSpeed : float) : float
{
	// Compute relative point and get the angle towards it
	var relative = characterTransform.InverseTransformPoint(targetPos);
	var angle = Mathf.Atan2 (relative.x, relative.z) * Mathf.Rad2Deg;
	// Clamp it with the max rotation speed
	var maxRotation = rotateSpeed * Time.deltaTime;
	var clampedAngle = Mathf.Clamp(angle, -maxRotation, maxRotation);
	// Rotate
	characterTransform.Rotate( 0, clampedAngle, 0);
	
	// Return the current angle
	return angle;
}

private function moveToDestination(characterObject : GameObject, 
								   currentDestinationIndex : int, 
								   characterDestinations : Array,
								   currentTime : float)
{
	
	var controller : CharacterController = characterObject.GetComponent(CharacterController);
	
	var movement : Vector3 = Vector3(0, -9.8, 0);
	
	if (characterObject.tag == "SoundEmiter") { // check spelling
		movement.y = 0;
	}
	
	var currentPosition : Vector3 = characterObject.transform.position;
	var destination : Vector3 = characterDestinations[currentDestinationIndex]["position"];
	
	if (currentDestinationIndex != 0 && ApplicationState.instance.animate) { 
				
		var timeLeft = characterDestinations[currentDestinationIndex]["endTime"] - currentTime;
		var direction : Vector3 = destination - currentPosition;
		var distance = direction.magnitude;
		direction.Normalize();
		var speed : float = distance / timeLeft;
		direction.Scale(Vector3( speed, speed, speed) );
		movement +=	direction;
		
	}
	
	
	
	if (currentPosition == ApplicationState.instance.DISAPPEAR_POS || 
		destination == ApplicationState.instance.DISAPPEAR_POS) {

		controller.transform.position = destination;		
		
	} else {

		movement.Scale(Vector3(Time.deltaTime, 
							   Time.deltaTime, 
							   Time.deltaTime));

		controller.Move(movement);
	}
	
	
	
}

function getValueAtTime(key : String, slot : Hashtable, currentTime : float)
{	
	var result : int = getValueIndexAtTime(key, slot, currentTime);
	if (result == INDEX_NOT_FOUND) return null;
	return slot[key][result];	
}

function getValueIndexAtTime(key : String, slot : Hashtable, currentTime : float) : int
{

	if (!slot[key]) {
		return INDEX_NOT_FOUND;
	}

	for (var i : int = 0; i < slot[key].length; i++) {
		if (slot[key][i]["endTime"] >= currentTime && 
			( i == 0 || slot[key][i-1]["endTime"] <= currentTime) ) {
			
			return i;	
		}
	}
	
	return INDEX_NOT_FOUND;	
}




function OnGUI() 
{

	if (ApplicationState.instance.playStructure["characters"]) {

		for (var currentCharKey in ApplicationState.instance.playStructure["characters"].Keys ) {
			
			if (ApplicationState.instance.playStructure["characters"][currentCharKey]["hasLines"]) {
				renderLine(currentCharKey);
			} else {
				// remove line rect from window manager
				WindowManager.instance.lineRects[currentCharKey] = Rect(0,0,0,0);
			}
		}	
	}
	
	if (ApplicationState.instance.playTime >= 2 && ApplicationState.instance.playTime <= 4) {
		//renderSound();
		renderStaticSound = true;
	} else {
		renderStaticSound = false;
	}
	//__soundEmitter.GetComponent(AxisControl).renderShowTexture = ! renderStaticSound;
	
	// if (renderStaticSound) {
	// 		var labelPos : Vector2 = Camera.main.WorldToScreenPoint(Vector3(__soundEmitter.transform.position.x,
	// 																		__soundEmitter.transform.position.y +1,
	// 																		__soundEmitter.transform.position.z));
	// 		GUI.Label(Rect(labelPos.x,Screen.height - labelPos.y,95,30),"Bang, bang, bang", soundStyle);
	// 	}
		
}

function renderSound() {
	
	renderStaticSound = true;
	
}

function renderLine( charachterKey : String)
	// nameRef : Hashtable )
{
	
	var nameRef : Hashtable = ApplicationState.instance.playStructure["characters"][charachterKey];
	var headerContent : GUIContent;
	var lineContent : GUIContent;
	var currentWidth;
	var ratio;
	var viewWidth;
	var viewHeight;
	var windowRect : Rect;
	var headerStyle : GUIStyle = new GUIStyle();
	
	for (var line : String in nameRef["currentLines"]) {
		// headerContent = GUIContent(nameRef["name"] as String + ": " );
		lineContent = GUIContent(nameRef["name"] as String + ": " + line);
	
		var newStyle : GUIStyle = new GUIStyle(lineBoxStyle);
		newStyle.normal.background = nameRef["speechBubble"];
			
		currentWidth = GUI.skin.GetStyle("label").CalcSize(lineContent).x;
	
	
		if (currentWidth > lineBoxWidth) {
			currentWidth = lineBoxWidth;
		}
	
		ratio = Camera.main.pixelWidth / Camera.main.pixelHeight;
		buttonPosn = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
															nameRef["gameObject"].collider.bounds.max.y,
															nameRef["gameObject"].transform.position.z)); 
	
		viewWidth = currentWidth;
		viewHeight = newStyle.CalcHeight(lineContent, currentWidth);
	
		windowRect = Rect(buttonPosn.x + (xOffset), 
						  		Camera.main.pixelHeight - buttonPosn.y - viewHeight - (yOffset), 
						  		viewWidth + contentPadding * 2, 
						  		viewHeight + contentPadding * 2); 
		
		if (windowRect.height <minSpeechBubbleHeight) {
			windowRect.height = minSpeechBubbleHeight;
		}				
		
		windowRect = WindowManager.instance.restrictToViewPort(windowRect);
		
						
		WindowManager.instance.lineRects[charachterKey] = windowRect;
		GUI.BeginGroup(windowRect);
		GUI.depth = 10;
		
	
		
		if (GUI.Button(Rect(0,0,windowRect.width, windowRect.height), lineContent, newStyle)) {
			
			if (ApplicationState.instance.selectedCharacter != nameRef["gameObject"]) {
				ApplicationState.instance.selectedCharacter = nameRef["gameObject"];
			} else {
				ApplicationState.instance.selectedCharacter = null;
			}
		}
		// GUI.Box(Rect(0, 0, viewWidth + contentPadding * 2, viewHeight + contentPadding * 2), "", lineBoxStyle);
			
		
		// GUI.Label(Rect(contentPadding, contentPadding, viewWidth, viewHeight), lineContent, textStyle); 
	
		GUI.EndGroup();
	}
	
}



