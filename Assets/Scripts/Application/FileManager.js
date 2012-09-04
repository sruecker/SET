

import System.Xml;
import ApplicationState;
import System.String;
import System.Text.RegularExpressions;

private function setEndTime(slot : Hashtable, time : float)
{
	if (time > slot["endTime"]) {
		slot["endTime"] = time;
	}
}

function loadSceneFile(fileName_ : String) : Hashtable
{
	var xmlDocument : System.Xml.XmlDocument = System.Xml.XmlDocument();
	if (fileName_ == null) {
		var playData : TextAsset = Resources.Load("XML/startPlay", TextAsset);
		xmlDocument.LoadXml(playData.text);
		
	} else {
		// need to catch exception
		var file : System.IO.StreamReader = System.IO.File.OpenText(fileName_);
		//var info : String = file.ReadToEnd();
		xmlDocument.Load(file);
		file.Close();
		file.Finalize();
	}
		
	var result : Hashtable = Hashtable();
	
	result["stage"] = xmlDocument["play"]["stage"]["model"].InnerText.Trim();
	result["set"] = null;
	
	if (xmlDocument["play"]["stage"]["set"]) {
		result["set"] = xmlDocument["play"]["stage"]["set"].InnerText.Trim();
	}
	
	// read characters
	var characterList : System.Xml.XmlNodeList = xmlDocument.GetElementsByTagName("character");
	result["characters"] = Hashtable();
	

	for (currentCharacter in characterList) {
		var key : String = currentCharacter.GetAttribute("id");	
		result["characters"][key] = Hashtable();

		var currentRGB : Array = currentCharacter["color"].InnerText.Trim().Split(" "[0]);
		
		result["characters"][key]["color"] = Color(float.Parse(currentRGB[0]),
												   float.Parse(currentRGB[1]),
												   float.Parse(currentRGB[2]));
												   
		result["characters"][key]["name"]  = currentCharacter["name"].InnerText.Trim();
		result["characters"][key]["model"] = currentCharacter["model"].InnerText.Trim();
		result["characters"][key]["mug"] = ApplicationState.instance.getColoredMug(result["characters"][key]["color"]);
		result["characters"][key]["hasLines"] = false;
		result["characters"][key]["currentLines"] = Array();
		result["characters"][key]["currentDestination"] = Vector3.zero;
		result["characters"][key]["drawPath"] = true;
		result["characters"][key]["speechBubble"] = ApplicationState.instance.getColoredSpeechBubble(result["characters"][key]["color"]);
		result["characters"][key]["characterControls"] = ApplicationState.instance.getColoredCharacterControlsBackground(result["characters"][key]["color"]);
	}
	
	characterList.Finalize();
	
	// load acts
	var charachterKey : String;
	var acts = xmlDocument["play"]["acts"].GetEnumerator();
	result["acts"] = Array();
	result["scenes"] = Array();
	
	// acts need to be in order
	
	while(acts.MoveNext()) {
		
				
		var newAct : Hashtable = Hashtable();
		
		newAct["id"] = acts.Current.GetAttribute("id");
		newAct["name"] = acts.Current["name"].InnerText.Trim();
		newAct["scenes"] = Array(); // scene indexes
		newAct["endTime"] = 0;
		// load scenes
		
		var scenes = acts.Current["scenes"].GetEnumerator();
		
		while(scenes.MoveNext()) {
			var newScene : Hashtable = Hashtable();
			
			newScene["id"] = scenes.Current.GetAttribute("id");
			newScene["name"] = scenes.Current["name"].InnerText.Trim();
			newScene["endTime"] = 0;
			
			// load destinations
			newScene["destinations"] = Hashtable();	
			
			for (characterKey in result["characters"].Keys) {
				newScene["destinations"][characterKey] = Array();
			}
			
			
			if (scenes.Current["destinations"]) { // only if there are new destinations
				var destinations = scenes.Current["destinations"].GetEnumerator();		

				while(destinations.MoveNext()) {
					
					charachterKey = destinations.Current.GetAttribute("character");
					
					// if ( !newScene["destinations"].Contains(charachterKey) ){
					// 					newScene["destinations"][charachterKey] = Array();
					// 				}
					
					var newDestination = Hashtable();

					newDestination["endTime"] = float.Parse(destinations.Current.GetAttribute("endTime"));
					
					setEndTime(newAct, newDestination["endTime"]);
					setEndTime(newScene, newDestination["endTime"]);
					
					
					var currentPos : Array = destinations.Current.InnerText.Trim().Split(" "[0]);	
					
					newDestination["position"] = Vector3(float.Parse(currentPos[0]),
														 float.Parse(currentPos[1]),
														 float.Parse(currentPos[2]));	
														 
					newScene["destinations"][charachterKey].Push(newDestination);
					
				}
				
			}
			

			// load lines
			newScene["lines"] = Array();
			
			if (scenes.Current["lines"]) {
				
				var lines = scenes.Current["lines"].GetEnumerator();
				
				while (lines.MoveNext()) {
					var newLine : Hashtable = Hashtable();
					
					newLine["character"] = lines.Current.GetAttribute("character");
					newLine["startTime"] = float.Parse(lines.Current.GetAttribute("startTime"));
					newLine["pace"] = float.Parse(lines.Current.GetAttribute("pace"));
					newLine["text"] = lines.Current.InnerText.Trim();
					//newLine["endTime"] = 
					// XXX Set endTime
					var endTime : float = newLine["startTime"] + ApplicationState.getLineTime(newLine["text"], newLine["pace"]);
					//newLine["endTime"] = endTime;
					setEndTime(newAct, endTime);
					setEndTime(newScene, endTime);
					//setEndTime(newAct, newLine["endTime"]);
					//setEndTime(newScene, newLine["endTime"]);
					

					
					newScene["lines"].Push(newLine);

				}
			}


			// load beats
			
			if (scenes.Current["beats"]) {
				newScene["beats"] = Array();
				var tempBeats = scenes.Current["beats"].InnerText.Trim();			
			
				// XXX for some reason \s+ does not work		
				var beats : Array = tempBeats.Split(" "[0]);
				
				// make beats floats
				var newBeat : float;
				for (currentBeat in beats) {

					newBeat = float.Parse(currentBeat);
					newScene["beats"].Push(newBeat);
				
					setEndTime(newAct, newBeat);
					setEndTime(newScene, newBeat);
				
				}
		 	}
			// load actions
		
			newScene["actions"] = Hashtable();
			if (scenes.Current["actions"]) { // only if there are new actions
				var actions = scenes.Current["actions"].GetEnumerator();		

				while(actions.MoveNext()) {
					charachterKey = actions.Current.GetAttribute("character");

					if ( !newScene["actions"].Contains(charachterKey) ){
						newScene["actions"][charachterKey] = Array();
					}

					var newAction = Hashtable();
					newAction["endTime"] = float.Parse(actions.Current.GetAttribute("endTime"));
					
					var currentAction : CharacterActions;
					var actionString : String = actions.Current.GetAttribute("type");
					
					if (actionString == "Sit") {
						currentAction = CharacterActions.Sit;
					} else if (actionString == "Kneel") {
						currentAction = CharacterActions.Kneel;
					} else if (actionString == "Lay") {
						currentAction = CharacterActions.Lay;
					} else { // default is stand action
						currentAction = CharacterActions.Stand;
					}
				
					
					newAction["type"] = currentAction;
					
					newScene["actions"][charachterKey].Push(newAction);
					
					setEndTime(newAct, newAction["endTime"]);
					setEndTime(newScene, newAction["endTime"]);
					
					
					
				}
			}
			
			result["scenes"].Push(newScene);
			newAct["scenes"].Push(result["scenes"].length - 1);
			
			
			
		}
		
		result["acts"].Push(newAct);

	}
	
	// load annotations
	result["annotations"] = Array();
	if ( xmlDocument["play"]["annotations"]) {
		var annotations = xmlDocument["play"]["annotations"].GetEnumerator();

		while(annotations.MoveNext()) {
			
			var newAnnotation : Hashtable = Hashtable();
		
			newAnnotation["startTime"] = float.Parse(annotations.Current.GetAttribute("startTime"));
			newAnnotation["sd"] = boolean.Parse(annotations.Current.GetAttribute("sd"));
			// character
			if (annotations.Current.GetAttribute("character") != "") {
				newAnnotation["character"] = annotations.Current.GetAttribute("character");
			}
		
			// endTime
			if (annotations.Current.GetAttribute("endTime") != "") {
				newAnnotation["endTime"] = float.Parse(annotations.Current.GetAttribute("endTime"));
			}
	
			// header
			if (annotations.Current.GetAttribute("header") != "") {
				newAnnotation["header"] = annotations.Current.GetAttribute("header");
			}

			if (annotations.Current.GetAttribute("image") != "") {
				var shortPath = annotations.Current.GetAttribute("image");
				var xmlPath;
				newAnnotation["origImage"] = shortPath;
				
				if (Application.platform == RuntimePlatform.OSXPlayer || Application.platform == RuntimePlatform.OSXEditor) {
					match = Regex.Match(fileName_, "(.+/)");
					xmlPath = match.Groups[0].Value;
					newAnnotation["image"] = shortPath.Replace("file://", "file://"+ xmlPath);
				} else if (Application.platform == RuntimePlatform.WindowsPlayer || Application.platform == RuntimePlatform.WindowsEditor) {
					//newAnnotation["image"] = shortPath.Replace("file://", "file:\\\\"+ xmlPath.Replace('/', "\\"));
					match = Regex.Match(fileName_, '(.+\\\\)');
					xmlPath = match.Groups[0].Value;
					newAnnotation["image"] = shortPath.Replace("file://", "file://"+ xmlPath);
				} else {
					Debug.Log("FAIL");
					Debug.Log(Application.platform);
				}
			}
		
			newAnnotation["text"] = annotations.Current.InnerText.Trim();
			newAnnotation['isSelected'] = false;
			result["annotations"].Push(newAnnotation);
		}
	}
	// load directions
	
	// result["directions"] = Array();
	// 
	// if (xmlDocument["play"]["annotations"]) {
	// 	var directions = xmlDocument["play"]["annotations"].GetEnumerator();
	// 	
	// 	while(directions.MoveNext()) {
	// 		var newDirection : Hashtable = Hashtable();
	// 		
	// 		// to be used later
	// 		newDirection["object"] = "";
	// 		if (directions.Current.GetAttribute("object")) {
	// 			newDirection["object"] = directions.Current.GetAttribute("object");
	// 		}
	// 		
	// 		newDirection["startTime"] = float.Parse(directions.Current.GetAttribute("startTime"));
	// 		newDirection["endTime"] = float.Parse(directions.Current.GetAttribute("endTime"));
	// 		newDirection["text"] = directions.Current.InnerText.Trim(); 
	// 		
	// 		result["directions"].Push(newDirection);
	// 	}
	// }
	
	
	// load views
	
	var views = xmlDocument["play"]["views"].GetEnumerator();
	result["views"] = Hashtable();

	while(views.MoveNext()) {
			
		var newView : Hashtable = Hashtable();
		
		var viewName : String = views.Current.GetAttribute("id");
		newView["location"] = StringToVector3(views.Current["location"].InnerText.Trim());
		newView["lookAt"] = StringToVector3(views.Current["lookAt"].InnerText.Trim());
		
		if (views.Current["name"]) {
			newView["name"] = views.Current["name"].InnerText.Trim();
		} else {
			newView["name"] = viewName;
		}
		result["views"][viewName] = newView;
	}
	
	// load flags
	
	//result["flags"] = new Array();
	
	// DO ACTUAL FLAGS LOADING
	
	//var flags = xmlDocument["play"]["flags"].GetEnumerator();
	
	// while (flags.MoveNext()) {
	// 		var tempFlags = flags.Current.InnerText.Trim();
	// 		var flagTimes : Array = tempFlags.Split(" "[0]);
	// 		for (var currentFlag in flagTimes) {
	// 			result["flags"].push(float.Parse(currentFlag));
	// 		}
	// 	}

	
	ApplicationState.instance.playTimeLength = result["acts"][result["acts"].length-1]["endTime"];
	
	if (ApplicationState.instance.playTimeLength <= 1) {
		ApplicationState.instance.playTimeLength = 1;
	}
	
	xmlDocument.Finalize();		
    return result;
}

function saveApplicationState(filename_ : String)
{
	var xmlDocument : System.Xml.XmlDocument = System.Xml.XmlDocument();	
	
	xmlDocument.LoadXml("<play />");
	
	// set the stage
	var stageElement : System.Xml.XmlElement = xmlDocument.CreateElement("stage");
	var modelElement : System.Xml.XmlElement = xmlDocument.CreateElement("model");

	
	modelElement.InnerText = ApplicationState.instance.playStructure["stage"];
	
	stageElement.AppendChild(modelElement);
	
	if (ApplicationState.instance.playStructure["set"]){
			var setElement : System.Xml.XmlElement = xmlDocument.CreateElement("set");
			setElement.InnerText = ApplicationState.instance.playStructure["set"];
			stageElement.AppendChild(setElement);
	}
	//stageElement.InnerText = ApplicationState.instance.playStructure["stage"];
	
	xmlDocument.DocumentElement.AppendChild(stageElement);

	// set the cast
	addCharactersToXML(xmlDocument);	
		
	// set the acts
	addActsToXML(xmlDocument);
		
	// set the annotations
	addAnnotationsToXML(xmlDocument);
	
	addViewsToXML(xmlDocument);
	
	//addFlagsToXML(xmlDocument);
	
	var testFileName : String = filename_.ToLower();
	if (! testFileName.EndsWith(".xml")) {
		filename_ += ".xml";
	}
		
	xmlDocument.Save(filename_);
	
	xmlDocument.Finalize();	
}

function addAnnotationsToXML(xmlDocument : System.Xml.XmlDocument)
{
	var annotationsElement : System.Xml.XmlElement = xmlDocument.CreateElement("annotations");
	
	for (var annotation in ApplicationState.instance.playStructure["annotations"]) {
		var singleAnnotationElement : System.Xml.XmlElement = xmlDocument.CreateElement("annotation");
	
		singleAnnotationElement.SetAttribute("startTime" ,annotation["startTime"].ToString());
		
		if (annotation["sd"]) {
			singleAnnotationElement.SetAttribute("sd", "true");
		} else {
			singleAnnotationElement.SetAttribute("sd", "false");
		}
		
		if (annotation.ContainsKey("endTime")) {
			singleAnnotationElement.SetAttribute("endTime" ,annotation["endTime"].ToString());
		}

		if (annotation.ContainsKey("character")) {
			singleAnnotationElement.SetAttribute("character" ,annotation["character"].ToString());
		}
		
		if (annotation.ContainsKey("header")) {
			singleAnnotationElement.SetAttribute("header" ,annotation["header"].ToString());
		}
		
		if (annotation.ContainsKey("origImage")) {
			singleAnnotationElement.SetAttribute("image" ,annotation["origImage"].ToString());
		}

		singleAnnotationElement.InnerText = annotation["text"];

		annotationsElement.AppendChild(singleAnnotationElement);
	}
	
	xmlDocument.DocumentElement.AppendChild(annotationsElement);

}

function addViewsToXML(xmlDocument : System.Xml.XmlDocument)
{
	var viewsElement : System.Xml.XmlElement = xmlDocument.CreateElement("views");
	
	for (var view in ApplicationState.instance.playStructure["views"]) {
		var singleViewElement : System.Xml.XmlElement = xmlDocument.CreateElement("view");
		singleViewElement.SetAttribute("id", view.Key);
		
		var locationElement : System.Xml.XmlElement = xmlDocument.CreateElement("location");
		var lookAtElement : System.Xml.XmlElement = xmlDocument.CreateElement("lookAt");
		var nameElement : System.Xml.XmlElement = xmlDocument.CreateElement("name");
		
		locationElement.InnerText = Vector3ToString(view.Value["location"]);
		lookAtElement.InnerText = Vector3ToString(view.Value["lookAt"]);
		nameElement.InnerText = view.Value["name"];
		
		singleViewElement.AppendChild(locationElement);
		singleViewElement.AppendChild(lookAtElement);
		singleViewElement.AppendChild(nameElement);

		viewsElement.AppendChild(singleViewElement);
	}
	
	xmlDocument.DocumentElement.AppendChild(viewsElement);

}

function addFlagsToXML(xmlDocument : System.Xml.XmlDocument)
{
	var flagsElement : System.Xml.XmlElement = xmlDocument.CreateElement("flags");
	var flagString : String = "";
	for (var flag in ApplicationState.instance.playStructure["flags"]) {
		flagString = flagString + " " + flag.ToString();
	}
	
	flagsElement.InnerText = flagString;
	xmlDocument.DocumentElement.AppendChild(flagsElement);
	
}

function addCharactersToXML( xmlDocument : System.Xml.XmlDocument)
{
	var castElement : System.Xml.XmlElement = xmlDocument.CreateElement("cast");
	
	for (var charachterKey in ApplicationState.instance.playStructure["characters"].Keys) {
		var characterElement : System.Xml.XmlElement = xmlDocument.CreateElement("character");
		
		characterElement.SetAttribute("id", charachterKey);
		
		var nameElement : System.Xml.XmlElement = xmlDocument.CreateElement("name");
		nameElement.InnerText = ApplicationState.instance.playStructure["characters"][charachterKey]["name"];
		
		var colorElement : System.Xml.XmlElement = xmlDocument.CreateElement("color");
		
		var characterColor : Color = ApplicationState.instance.playStructure["characters"][charachterKey]["color"];
		
		colorElement.InnerText = characterColor.r.ToString() + " " +
								 characterColor.g.ToString() + " " +
								 characterColor.b.ToString();
		
		var modelElement : System.Xml.XmlElement = xmlDocument.CreateElement("model");
		
		modelElement.InnerText = ApplicationState.instance.playStructure["characters"][charachterKey]["model"];
		
		characterElement.AppendChild(nameElement);
		characterElement.AppendChild(colorElement);
		characterElement.AppendChild(modelElement);
		castElement.AppendChild(characterElement);
	}

	xmlDocument.DocumentElement.AppendChild(castElement);
}

function addActsToXML(xmlDocument : System.Xml.XmlDocument)
{
	var actsElement : System.Xml.XmlElement = xmlDocument.CreateElement("acts");
	
	var actCount : int = ApplicationState.instance.playStructure["acts"].length;
	
	for (var i : int = 0; i < actCount; i++) {
		var currentActElement : System.Xml.XmlElement = xmlDocument.CreateElement("act");
		
		currentActElement.SetAttribute("id", ApplicationState.instance.playStructure["acts"][i]["id"]);
		
		// set act name
		var nameElement : System.Xml.XmlElement = xmlDocument.CreateElement("name");
		nameElement.InnerText =  ApplicationState.instance.playStructure["acts"][i]["name"];
		currentActElement.AppendChild(nameElement);
		
		// add scenes
		
		var scenesElement : System.Xml.XmlElement = xmlDocument.CreateElement("scenes");
		
		var sceneCount = ApplicationState.instance.playStructure["acts"][i]["scenes"].length;
		
		for (var j : int = 0; j < sceneCount; j++) {
			
			var currentSceneElement : System.Xml.XmlElement = xmlDocument.CreateElement("scene");
			
			var sceneIndex = ApplicationState.instance.playStructure["acts"][i]["scenes"][j];
			
			// id
			currentSceneElement.SetAttribute("id", ApplicationState.instance.playStructure["scenes"][sceneIndex]["id"]);
			// name
			setXMLSceneName(xmlDocument, currentSceneElement, ApplicationState.instance.playStructure["scenes"][sceneIndex]["name"]);
			// destinations
			setXMLSceneDestinations(xmlDocument, currentSceneElement, ApplicationState.instance.playStructure["scenes"][sceneIndex]["destinations"]);
			
			// actions
			setXMLSceneActions(xmlDocument, currentSceneElement,  ApplicationState.instance.playStructure["scenes"][sceneIndex]["actions"]);
			// lines
			setXMLSceneLines(xmlDocument, currentSceneElement, ApplicationState.instance.playStructure["scenes"][sceneIndex]["lines"]);
			// beats
			setXMLSceneBeats(xmlDocument, currentSceneElement, ApplicationState.instance.playStructure["scenes"][sceneIndex]["beats"]);
		
			//ApplicationState.instance.playStructure["acts"]["scenes"][j];
			scenesElement.AppendChild(currentSceneElement);	
		}
			
		currentActElement.AppendChild(scenesElement);
				
		actsElement.AppendChild(currentActElement);
		
	}
	
	xmlDocument.DocumentElement.AppendChild(actsElement);

}

function setXMLSceneName(xmlDocument : System.Xml.XmlDocument, currentSceneElement : System.Xml.XmlElement, name : String)
{
	var nameElement : System.Xml.XmlElement = xmlDocument.CreateElement("name");
	nameElement.InnerText =  name;
	currentSceneElement.AppendChild(nameElement);
}

function setXMLSceneActions(xmlDocument : System.Xml.XmlDocument, currentSceneElement : System.Xml.XmlElement, actions : Hashtable)
{
	var actionsElement :  System.Xml.XmlElement = xmlDocument.CreateElement("actions");
	
	for (var characterKey in actions.Keys) {
		
		var actionCount : int = actions[characterKey].length;
		
		for (var i : int = 0; i < actionCount; i++) {
		
			var currentActionElement :  System.Xml.XmlElement = xmlDocument.CreateElement("action");
			currentActionElement.SetAttribute("character" , characterKey);
			
			currentActionElement.SetAttribute("endTime" , actions[characterKey][i]["endTime"].ToString());
			
			currentActionElement.SetAttribute("type" , actions[characterKey][i]["type"].ToString());
					
			actionsElement.AppendChild(currentActionElement);	
			
		}	
	}

	currentSceneElement.AppendChild(actionsElement);
	
}

function setXMLSceneDestinations(xmlDocument : System.Xml.XmlDocument, currentSceneElement : System.Xml.XmlElement, destinations : Hashtable)
{
	
	var destinationsElement :  System.Xml.XmlElement = xmlDocument.CreateElement("destinations");
	
	for (var characterKey in destinations.Keys) {
		
		var destinationCount : int = destinations[characterKey].length;
		
		for (var i : int = 0; i < destinationCount; i++) {
		
			var currentDestinationElement :  System.Xml.XmlElement = xmlDocument.CreateElement("destination");
			currentDestinationElement.SetAttribute("character" , characterKey);
			
			currentDestinationElement.SetAttribute("endTime" , destinations[characterKey][i]["endTime"].ToString());
			
			var position : Vector3 = destinations[characterKey][i]["position"];			
			
			currentDestinationElement.InnerText = position.x.ToString() + " " +
												  position.y.ToString() + " " +
												  position.z.ToString();
		
			destinationsElement.AppendChild(currentDestinationElement);	
			
		}	
	}

	currentSceneElement.AppendChild(destinationsElement);
}

function setXMLSceneLines(xmlDocument : System.Xml.XmlDocument, currentSceneElement : System.Xml.XmlElement, lines : Array)
{
	var linesCount : int = lines.length;
	
	if (linesCount > 0) {
		var linesElement : System.Xml.XmlElement = xmlDocument.CreateElement("lines");

		for (var i : int = 0 ; i < linesCount; i++) {
			
			var currentLineElement : System.Xml.XmlElement = xmlDocument.CreateElement("line");

			currentLineElement.SetAttribute("character" ,lines[i]["character"]);
			currentLineElement.SetAttribute("startTime" ,lines[i]["startTime"].ToString());
			currentLineElement.SetAttribute("pace" ,lines[i]["pace"].ToString());
			currentLineElement.InnerText = lines[i]["text"];
			
			linesElement.AppendChild(currentLineElement);
			
		}
		
		currentSceneElement.AppendChild(linesElement);
	}
}

function setXMLSceneBeats(xmlDocument : System.Xml.XmlDocument, currentSceneElement : System.Xml.XmlElement, beats : Array)
{
	var beatElement : System.Xml.XmlElement = xmlDocument.CreateElement("beats");
	if (beats) {
		var beatCount : int = beats.length;
		var beatInnerText : String = "";
		for (var i : int = 0; i < beatCount - 1; i++) {
				beatInnerText = beatInnerText + beats[i].ToString()  + " ";
		}
		beatInnerText = beatInnerText + beats[i].ToString();
		beatElement.InnerText = beatInnerText;
	
		currentSceneElement.AppendChild(beatElement);
	}
}

private function StringToVector3(str : String): Vector3 {
	var strArray : String[] = str.Split(" "[0]);
	var vector : Vector3 = Vector3(float.Parse(strArray[0]), float.Parse(strArray[1]), float.Parse(strArray[2]));
	return vector;
}

private function Vector3ToString(vec : Vector3): String {
	var str : String = vec.x + " " + vec.y + " " + vec.z;
	return str;
}