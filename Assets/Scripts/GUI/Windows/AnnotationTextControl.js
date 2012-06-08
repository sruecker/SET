

public var annotationStyle : GUIStyle;
public var annotationContentStyle : GUIStyle;
public var annotationWidth : int = 200;

function OnGUI() {
	
	
	if (!ApplicationState.instance.loadingNewFile &&
		(ApplicationState.instance.showOnScreenTextAnnotations || 
		ApplicationState.instance.showOnScreenImageAnnotations))  {// if show annotations
		
		for (var annotation : Hashtable in ApplicationState.instance.playStructure["annotations"]) {
			
			if (annotation.Contains('endTime') && 
				ApplicationState.instance.playTime >= annotation['startTime'] && 
				ApplicationState.instance.playTime <= annotation['endTime']) {
					
					// render annotation
					
					var showImage : boolean = false;
					var showText : boolean = false;
					
					var annotationPosition : Rect = Rect(0,0,annotationWidth,0);
					var content : GUIContent = GUIContent();
					var stringPart : String = "";
					// if character change position
					if (annotation.ContainsKey("character")) {
						var nameRef : Hashtable = ApplicationState.instance.playStructure["characters"][annotation["character"]];
						var newPos : Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
																						nameRef["gameObject"].collider.bounds.max.y,
																						nameRef["gameObject"].transform.position.z));
										
						annotationPosition.x = newPos.x;
						annotationPosition.y = Screen.height - newPos.y;

						stringPart = nameRef["name"] + ":\n" + annotation['text'];
						
					} else if (annotation.ContainsKey("header")){

						stringPart = nameRef["header"] + ":\n" + annotation['text'];
					} else {

						stringPart = annotation['text'];
					}
					var showAnnotation = false;
					if (annotation.ContainsKey("imageTexture") && ApplicationState.instance.showOnScreenImageAnnotations) {
						if (ApplicationState.instance.showOnScreenTextAnnotations){
							// text and image
							content = GUIContent(stringPart, annotation["imageTexture"] as Texture2D);
							showAnnotation = true;
							showImage = true;
							showText = true;
						} else {
							// image
							content = GUIContent(annotation["imageTexture"] as Texture2D);
							showAnnotation = true;
							showImage = true;
						}
					} else if (ApplicationState.instance.showOnScreenTextAnnotations) {
						// text
						content = GUIContent(stringPart);
						showAnnotation = true;
						showText = true;
					}
																	
					// render
					annotationPosition.height = annotationStyle.CalcHeight(content, annotationWidth);					
					annotationPosition = WindowManager.instance.restrictToViewPort(annotationPosition);					
					if (showAnnotation) {
						// GUI.Label(annotationPosition, content, annotationStyle);
						// GUI.Box(annotationPosition, content, annotationStyle);
						// GUI.BeginGroup(annotationPosition, annotationStyle);
						GUI.BeginGroup(annotationPosition);
						GUILayout.BeginVertical(annotationStyle, GUILayout.Width(200));
						if (showImage) {
							GUILayout.Label(GUIContent(annotation["imageTexture"] as Texture2D), annotationContentStyle, GUILayout.Width(195));
						}
						if (showText) {
							GUILayout.Label(GUIContent(stringPart), annotationContentStyle, GUILayout.Width(195));
						}
						// GUILayout
						GUILayout.EndVertical();
						GUI.EndGroup();
						// GUI.EndGroup();
					}
				}
			
		}
		
	}
	
}