

import ApplicationState;

private var __currentAnimationIndex : int;
private var __characterKey : String;
private var __animation : Animation;
private var __actions : Array;
private var __currentScene : Hashtable;
private var __previousScene : Hashtable;
private var __nextActionTime : float;
private var __nextAction : CharacterActions;
private var __previousAction : CharacterActions;
private var __lastTime : float;
function Awake()
{
	InitializeControlVariables();
}

function InitializeControlVariables()
{
	__currentAnimationIndex = -1;
	__nextActionTime = ApplicationState.instance.playTimeLength;
	__previousAction = CharacterActions.Inaction;
	__nextAction = CharacterActions.Stand;
}

function Start()
{
	// get charachterKey
	// get animation
	
	__animation = gameObject.GetComponentInChildren(Animation);
	__characterKey = name;
	__previousScene = null;
	__currentScene = null;
	__lastTime = 0;
}

function getNextActionIndex() {
		
	if (! __actions || __actions.length == 0) {
		return -1;
	}
	
	
	for (var i:int=0; i<__actions.length; i++) {
		if (ApplicationState.instance.playTime <= __actions[i]["endTime"]) {
			break;
		}
	}
	
//	if (i == __actions.length) --i;
	
	return i;
		
}


function JumpToPreviousAction() {
	
	var currentTime : float = ApplicationState.instance.playTime;
	__currentScene = ApplicationState.instance.getSceneAt(currentTime);
	__actions = __currentScene["actions"][__characterKey];
	
	var nextIndex : int = getNextActionIndex();
	if (nextIndex > 0) --nextIndex;
	
	if (nextIndex != -1) {
		__previousAction = __nextAction;
		__nextAction = __actions[nextIndex]["type"];
		__nextActionTime = __actions[nextIndex]["endTime"];	
	} else {
		__nextAction = CharacterActions.Stand;
		__previousAction = __nextAction;
		__nextActionTime = 0;
	}
	
	switch(__nextAction) {
		case CharacterActions.Stand:
			__animation.Play("idle");
		break;
		case CharacterActions.Sit:
			__animation.Play("fastSit");
		break;
		case CharacterActions.Kneel:
			__animation.Play("fastKneel");			
		break;
		case CharacterActions.Lay:
			__animation.Play("fastLay");
		break;
	}	
	
	//}
	/*
	var currentTime : float = ApplicationState.instance.playTime;
	__currentScene = ApplicationState.instance.getSceneAt(currentTime);
	__actions = __currentScene["actions"][__characterKey];
	var nextIndex : int = getNextActionIndex();
	if (nextIndex != -1) nextIndex--;
	//if (name == "Metellus")
	//	Debug.Log(name + " " + nextIndex);
	if (nextIndex != -1) {
		__previousAction = __nextAction;
		__nextAction = __actions[nextIndex]["type"];
		__nextActionTime = __actions[nextIndex]["endTime"];	
	} else {
		__nextAction = CharacterActions.Stand;
		__previousAction = __nextAction;
		__nextActionTime = 0;
	}
	
	switch(__nextAction) {
		case CharacterActions.Stand:
			__animation.CrossFade("idle");
			//if (name == "Metellus")Debug.Log("idle");
		break;
		case CharacterActions.Sit:
			__animation.CrossFade("fastSit");
			//if (name == "Metellus")Debug.Log("fastSit");
		break;
		case CharacterActions.Kneel:
			__animation.CrossFade("fastKneel");
			//if (name == "Metellus")Debug.Log("fastKneel");
		break;
		case CharacterActions.Lay:
			__animation.CrossFade("fastLay");
			//if (name == "Metellus")Debug.Log("fastLay");
		break;
	}
	*/
}

function Update()
{
	//__animation.CrossFade("fastSit");
	
	var animating : boolean = ApplicationState.instance.animate;
	var dragging : boolean = ApplicationState.instance.scrubberDraged;
	var playingForward : boolean = ApplicationState.instance.playingForward;
	
	if (animating) {
		var currentTime : float = ApplicationState.instance.playTime;
		__currentScene = ApplicationState.instance.getSceneAt(currentTime);
		
		if (__currentScene != __previousScene) {
			// XXX change scenes
			InitializeControlVariables();
			//__animation.CrossFade("idle", 0.01);
			__previousScene = __currentScene;
		}
		
		__actions = __currentScene["actions"][__characterKey];
		
		if ( animating && __nextActionTime <= ApplicationState.instance.playTime) {
			switch(__nextAction) {
				case CharacterActions.Stand:
					AnimateStand();
				break;
				case CharacterActions.Sit:
					AnimateSit();
				break;
				case CharacterActions.Kneel:
					AnimateKneel();
				break;
				case CharacterActions.Lay:
					AnimateLay();
				break;
			}
		} 
		// else if (dragging) {
		// 	switch(__nextAction) {
		// 		case CharacterActions.Stand:
		// 			__animation.CrossFade("idle");
		// 		break;
		// 		case CharacterActions.Sit:
		// 			__animation.CrossFade("fastSit");
		// 		break;
		// 		case CharacterActions.Kneel:
		// 			__animation.CrossFade("fastKneel");
		// 		break;
		// 		case CharacterActions.Lay:
		// 			__animation.CrossFade("fastLay");
		// 		break;
		// 	}
		// }

		//if (animating || (dragging && playingForward)) {
		var nextIndex : int = getNextActionIndex();
		//} 
		// else if(dragging && !playingForward) {
		// 			nextIndex = getNextActionIndex();
		// 			--nextIndex;
		// 			Debug.Log(nextIndex);
		// 			if (nextIndex < 0) nextIndex = -1;
		// 			nextIndex=0;
		// 		}
		
		if (nextIndex != __currentAnimationIndex) {
			__currentAnimationIndex = nextIndex;
			if (__currentAnimationIndex != -1) {
				__previousAction = __nextAction;
				__nextAction = __actions[__currentAnimationIndex]["type"];
				__nextActionTime = __actions[__currentAnimationIndex]["endTime"];
			}
		}
	} else if(dragging) {
		JumpToPreviousAction();
		
	}
}


function AnimateStand()
{
	switch(__previousAction) {
		case CharacterActions.Stand:
		break;
		case CharacterActions.Sit:
		__animation.CrossFade("negSit");
		break;
		case CharacterActions.Kneel:
		__animation.CrossFade("negKneel");
		break;
		case CharacterActions.Lay:
		__animation.CrossFade("negLay");		
		break;
		case CharacterActions.Inaction:
		__animation.CrossFade("fastStand");
		break;
	}
	
}

function AnimateSit()
{
	switch(__previousAction) {
		case CharacterActions.Stand:
		break;
		case CharacterActions.Sit:
		return;
		case CharacterActions.Kneel:
		__animation.CrossFade("negKneel");
		break;
		case CharacterActions.Lay:
		__animation.CrossFade("negLay");
		break;
		case CharacterActions.Inaction:
		__animation.CrossFade("fastSit");
		break;
	}
	__animation.CrossFade("sit");
	
	
}

function AnimateKneel()
{
	switch(__previousAction) {
		case CharacterActions.Stand:
		break;
		case CharacterActions.Sit:
		__animation.CrossFade("negSit");
		break;
		case CharacterActions.Kneel:
		return;
		case CharacterActions.Lay:
		__animation.CrossFade("negLay");
		break;
		case CharacterActions.Inaction:
		__animation.CrossFade("fastKneel");
		break;
	}
	__animation.CrossFade("kneel");		
	
}

function AnimateLay()
{
	switch(__previousAction) {
		case CharacterActions.Stand:
		break;
		case CharacterActions.Sit:
		__animation.CrossFade("negSit");
		break;
		case CharacterActions.Kneel:
		__animation.CrossFade("negKneel");
		break;
		case CharacterActions.Lay:
		return;
		case CharacterActions.Inaction:
		__animation.CrossFade("fastLay");
		break;
	}
	__animation.CrossFade("lay");
	
}