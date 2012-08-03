

public var annotationStyle : GUIStyle;
// public var annotationContentStyle : GUIStyle;
public var annotationWidth : int = 200;
public var contentStyle : GUIStyle;

public var headerStyle : GUIStyle;
public var lineStyle : GUIStyle;

private var annotationsWindowsControl : AnnotationsWindowControl;


function Start () {
	annotationsWindowsControl = GameObject.Find("AnnotationsWindow").GetComponent(AnnotationsWindowControl);
}


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
					
					var annotationPosition : Rect = Rect(30,30,annotationWidth,200);
					var content : GUIContent = GUIContent();
					var stringPart : String = annotation['text'];
					var headerPart : String = "";
					// if character change position
					if (annotation.ContainsKey("character")) {
						var nameRef : Hashtable = ApplicationState.instance.playStructure["characters"][annotation["character"]];
						var newPos : Vector3 = Camera.main.WorldToScreenPoint(Vector3(nameRef["gameObject"].transform.position.x,
																						nameRef["gameObject"].collider.bounds.max.y,
																						nameRef["gameObject"].transform.position.z));
										
						annotationPosition.x = newPos.x;
						annotationPosition.y = Screen.height - newPos.y;
						headerPart =  nameRef["name"] + ":";
						// stringPart = nameRef["name"] + ":\n" + annotation['text'];
						
					} else if (annotation.ContainsKey("header")){
						headerPart =  nameRef["header"] + ":";
						// stringPart = nameRef["header"] + ":\n" + annotation['text'];
					} 
					// else {

						// stringPart = annotation['text'];
					// }
					var showAnnotation = false;
					var annotationHeight = 0;
					
					if (annotation.ContainsKey("imageTexture") && ApplicationState.instance.showOnScreenImageAnnotations) {
						if (ApplicationState.instance.showOnScreenTextAnnotations){
							// text and image
							//content = GUIContent(stringPart, annotation["imageTexture"] as Texture2D);
							showAnnotation = true;
							showImage = true;
							showText = true;
						} else {
							// image
							//content = GUIContent(annotation["imageTexture"] as Texture2D);
							showAnnotation = true;
							showImage = true;
						}
					} else if (ApplicationState.instance.showOnScreenTextAnnotations) {
						// text
						//content = GUIContent(stringPart);
						showAnnotation = true;
						showText = true;
					}
											
					
											
																	
					// render
					// annotationPosition.height = 200; // XXX
					// annotationPosition.height = annotationStyle.CalcHeight(content, annotationWidth);					
					if (showAnnotation) {
						// GUI.Label(annotationPosition, content, annotationStyle);
						// GUI.Box(annotationPosition, content, annotationStyle);
						// GUI.BeginGroup(annotationPosition, annotationStyle);
						// GUI.Box(annotationPosition,"");
						
						// if (showImage) {
						// 						
						// 					}
						// 					
						if (showImage || showText) {
							annotationHeight += 20;
						}
						
						if (headerPart != "") {
							annotationHeight += 40;
						}
						
						if (showText) {
							content = GUIContent(stringPart);
							annotationHeight += contentStyle.CalcHeight(content, annotationWidth);
						}
						
						var imageHeight = 0;
						var imageWidth = 190;
						if (showImage) {
							// annotationPosition.height += 200;
							// annotationHeight += 200;
							
							imageHeight = annotation["imageTexture"].height * imageWidth / annotation["imageTexture"].width;
							annotationHeight += imageHeight + 10;
							
						}
						
						annotationPosition.height = annotationHeight;
						annotationPosition = WindowManager.instance.restrictToViewPort(annotationPosition);					
				
						
						var contentPosition : Rect = annotationPosition;
						contentPosition.x = 5;
						contentPosition.y = 5;						
						annotationPosition.width += 10;
						annotationPosition.height += 10;					
						
						
						GUI.BeginGroup(annotationPosition, annotationStyle);
						GUI.BeginGroup(contentPosition, contentStyle);
						// GUILayout.BeginVertical(contentStyle);
						var imagePadding = 0;
						if (showImage) {
							// GUILayout.Label(GUIContent(annotation["imageTexture"] as Texture2D));
							GUI.DrawTexture(Rect(5, 2, imageWidth, imageHeight), annotation["imageTexture"] as Texture2D);
							imagePadding = imageHeight+5;
						}
						// GUILayout.BeginHorizontal();
						
						if (showImage || showText) {
							
							var headerRect : Rect = Rect(5, 2 + imagePadding, 18, 18);
							
							if (annotation.Contains("character")) {
								if (!annotation["sd"]) {
									GUI.Label(headerRect, annotationsWindowsControl.headerPointerTextures[annotation["character"]]);
								} else {
									GUI.Label(headerRect, annotationsWindowsControl.headerSquareTextures[annotation["character"]]);
								}
							} else {

								if (!annotation["sd"]) {
									GUI.Label(headerRect, annotationsWindowsControl.headerPointerTextures["scene"]);
								} else {
									GUI.Label(headerRect, annotationsWindowsControl.headerSquareTextures[annotation["scene"]]);
								}

							}
						}
						// GUILayout.BeginVertical();
						var textPadding = 0;
						if ((showImage || showText) && headerPart != "") {
							GUI.Label(Rect(20, 0 + imagePadding, annotationWidth - 18, 20), headerPart, headerStyle);
							// GUILayout.Label(GUIContent(headerPart));
							textPadding = 20;
						}
						// Debug.Log(">"+stringPart+"<");
						
						if (showText) {
							GUI.Label(Rect(20, textPadding + imagePadding, annotationWidth - 18, 180), stringPart, lineStyle);
							// GUILayout.Label(GUIContent(stringPart));
						}
						// GUILayout.EndVertical();
						// GUILayout.EndHorizontal();
						
						// GUILayout
						// GUILayout.EndVertical();
						GUI.EndGroup();
						GUI.EndGroup();
						// GUI.EndGroup();
					}
				}
			
		}
		
	}
	
}