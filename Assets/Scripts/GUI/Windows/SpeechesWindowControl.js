
import ApplicationState;

class SpeechesWindowControl extends ToolTipSender {

	var gSkin : GUISkin;
	var speechBoxSkin : GUISkin;
	var actSceneLabelStyle : GUIStyle;
	var lineTextStyle : GUIStyle;
	//~ var characterNameFont : Font;
	//~ var characterNameStyle : GUIStyle;
	//~ var characterLineBackground : Texture2D;
	var sceneLineTexture : Texture2D;
	var currentTimeTexture : Texture2D;
	var resizeWindowButtonSize : int = 14;
	var resizeWindowButtonTexture : Texture2D;
	var resizeWindowButtonStyle : GUIStyle;
	var windowWidth : int = 200;
	var speechStyle : GUIStyle;
	var mugButtonStyle : GUIStyle;

	var dockButtonTexture : Texture2D;
	var undockButtonTexture : Texture2D;

	var toggleBubbleButtonTexture : Texture2D;
	var toggleReaderButtonTexture : Texture2D;
	var toggleJumpButtonTexture : Texture2D;
	var toggleJumpDisabledButtonTexture : Texture2D;
	var popOutButtonTexture : Texture2D;
	var closeButtonTexture : Texture2D;
	var copyButtonTexture : Texture2D;

	var dragButtonStyle : GUIStyle; // should be clear

	var startPosDragStyle : GUIStyle;
	var endPosDragStyle : GUIStyle;

	private var __speechCache : Array;

	//private var __speechesWindowRect : Rect;
	private var __speechPositions : Array;
	private var __speechHeightModifyer : float;
	private var __speechIndent : float;
	private var __speechOpenWidth : float;

	private var __speechOpenTracker : Hashtable;

	private var __doDrag : boolean;
	private var __dragInfo : Object;

	private var __scrollViewVector : Vector2;
	private var __popOutScrollViewVector : Vector2;
	private var __oldScrollViewVector : Vector2;
	private var __scrollHeight:float;
	private var __popOutScrollHeight:float;

	private var __linesLoaded : boolean;

	private var __initialClick : Vector2;
	private var __initialRect : Rect;
	private var __resizingWindow : boolean;
	private var __windowBeingResized : int;
	private var __showPopOut : boolean;

	private static var BUBBLE_MODE : int = 0;
	private static var READER_MODE : int = 1;
	private static var JUMP_READER_MODE : int = 2;
	private var __displayMode : int;
	private var __popOutDisplayMode : int;
	private var __originalRect : Rect;

	function Awake() {
		__linesLoaded = false;
		__speechPositions = new Array();
		__speechOpenTracker = new Hashtable();
		__doDrag = false;
		__resizingWindow = false;
		__dragInfo = {};
		__displayMode = BUBBLE_MODE;
		__popOutDisplayMode = JUMP_READER_MODE;
		__showPopOut = false;
		__scrollViewVector = Vector2.zero;
		__popOutScrollViewVector = Vector2.zero;
		__oldScrollViewVector = Vector2.zero;
		
		__originalRect = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID];
		WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID] = Rect(0,0,0,0);
		
	}

	function OnGUI () {
	
		GUI.skin = gSkin;
	
	
		if (!ApplicationState.instance.loadingNewFile) {
		
			if(WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID]) {
				if (WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].width < 200) {
					WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].width = 200;
				}
				if (WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].height < 150) {
					WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].height = 150;
				}
			}
		
			WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID] = GUI.Window(WindowManager.instance.SPEECHES_ID, 
					   WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID], 
					   windowFunction, 
					   "Speech");
			if (! WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID]) {
				GUI.BringWindowToBack(WindowManager.instance.SPEECHES_ID);								   
			}
	
			if (__showPopOut) {
				
				if (WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID] == Rect(0,0,0,0)) {
					WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID] = __originalRect;
				}
				
				WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID] = GUI.Window(WindowManager.instance.SPEECHES_POPOUT_ID, 
					   WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID], 
					   windowPopOutFunction, 
					   "Speech");
			} else {
				WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID] = Rect(0,0,0,0);
			}
			//UpdateToolTip();
		}	
	
	}

	private function windowFunction (windowID : int) {
		var winRect:Rect = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID];

		var toolPos : Rect;
		var styleString = "_POSITION-STYLE_";
		var toolTipPreString : String;
	
		toolPos = Rect(winRect.width - 80, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		var toggleButton:GUIContent;
		if (__displayMode != BUBBLE_MODE) {
			toggleButton = __displayMode == READER_MODE ? GUIContent(toggleJumpDisabledButtonTexture, toolTipPreString+"Jumping disabled"):GUIContent(toggleJumpButtonTexture, toolTipPreString+"Jumping enabled");
			if (GUI.Button(toolPos, toggleButton, dragButtonStyle)) {
				if (__displayMode == READER_MODE) __displayMode = JUMP_READER_MODE;
				else __displayMode = READER_MODE;
			}
		} else {
			GUI.enabled = false;
			GUI.Button(Rect(winRect.width - 80, 5, 16, 16), GUIContent(toggleJumpDisabledButtonTexture, toolTipPreString+"Jumping disabled"), dragButtonStyle);
			GUI.enabled = true;
		}

		toolPos = Rect(winRect.width - 60, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		toggleButton = __displayMode == BUBBLE_MODE ? GUIContent(toggleReaderButtonTexture, toolTipPreString+"Show reader view"):GUIContent(toggleBubbleButtonTexture, toolTipPreString+"Show speech bubble view");
		if (GUI.Button(toolPos, toggleButton, dragButtonStyle)) {
			if (__displayMode == BUBBLE_MODE) __displayMode = JUMP_READER_MODE;
			else __displayMode = BUBBLE_MODE;
		}
	
		toolPos = Rect(winRect.width - 40, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		if (GUI.Button(toolPos, GUIContent(popOutButtonTexture, toolTipPreString+"Show floating reader"), dragButtonStyle)) {
			__showPopOut = !__showPopOut;
			//~ GUI.BringWindowToFront(WindowManager.instance.SPEECHES_POPOUT_ID);
		}

		// Draw any Controls inside the window here
		var undockingContent : GUIContent;
		toolPos = Rect(winRect.width - 20, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;		
		if (WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID]) {
			undockingContent = GUIContent(dockButtonTexture,toolTipPreString+"Dock window");
		} else {
			undockingContent = GUIContent(undockButtonTexture,toolTipPreString+"Undock window");
		}
	

		if (GUI.Button(toolPos, undockingContent, dragButtonStyle)) {
			WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID] = ! WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID];
		
			if ( WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID] ) {
				WindowManager.instance.undock(WindowManager.instance.SPEECHES_ID);
				GUI.BringWindowToFront(WindowManager.instance.SPEECHES_ID);
			} else {
				WindowManager.instance.dock(WindowManager.instance.SPEECHES_ID);
				GUI.BringWindowToBack(WindowManager.instance.SPEECHES_ID);
			}

		}
	
		var scene:Object;
		var mug:Texture2D;
		var act : Hashtable;
		var line: Hashtable;
	
		switch (__displayMode) {
			case BUBBLE_MODE:
				var winMiddle:float = (winRect.height - 45) * 0.5;
	
				var scrollHeight:float = ApplicationState.instance.playTimeLength * __speechHeightModifyer + winRect.height;
				if (scrollHeight < winRect.height - 45) scrollHeight = winRect.height - 45;
				__scrollViewVector = GUI.BeginScrollView(
					Rect(0, 26, winRect.width, winRect.height - 45),
					__scrollViewVector,
					Rect(0, 0, winRect.width - 16, scrollHeight),
					false,
					true
				);
			
				if (__linesLoaded)  {
					calculateSpeechWidth();
			
					for (var actIndex:int = 0; actIndex < ApplicationState.instance.playStructure["acts"].length; actIndex++) {
					
						act = ApplicationState.instance.playStructure["acts"][actIndex];
					
						var sceneCount:int = 0;
						for (var sceneIndex : int in act["scenes"]) {
						
							scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
						
							// scene marker
							GUI.DrawTexture(Rect(0, __speechPositions[actIndex][sceneCount]["startPos"] + winMiddle, winRect.width, 1), sceneLineTexture);
						
							for (var i:int = 0; i < __speechPositions[actIndex][sceneCount]["lines"].length; i++) {
							
								line = __speechPositions[actIndex][sceneCount]["lines"][i];
							
								GUI.skin = speechBoxSkin;
							
								var lineStart:float = line["startPos"] + winMiddle;
								var lineHeight:float = line["endPos"] - line["startPos"];
								var lineWidth:float = __speechIndent;

								if (line["showText"]) lineWidth = __speechOpenWidth / line["overlap"];
								var xPos:float = line["indent"] * lineWidth;
							
								if (__doDrag) {
									if (__dragInfo["line"] == line) {
										lineWidth = __speechOpenWidth;
										xPos = 0;
										if (__dragInfo["type"] == "start") lineStart += __dragInfo["offset"];
										else lineHeight += __dragInfo["offset"];
									}
								}
							
								GUI.BeginGroup(Rect(xPos, lineStart, lineWidth, lineHeight), speechStyle);
							
								if (GUI.RepeatButton(Rect(0, 0, lineWidth, 8), "", startPosDragStyle)) {
									if (!__doDrag) {
										__dragInfo = {"act": actIndex, "scene": sceneCount, "line": line, "clickY": 0.0, "offset": 0.0, "type": "start"};
										var clickPos:Vector3 = Input.mousePosition;
										__dragInfo["clickY"] = Mathf.Abs(clickPos.y - Screen.height) - winRect.y;
										__doDrag = true;
									}
								}
								mug = ApplicationState.instance.playStructure["characters"][line["character"]]["mug"];
								if (!line["showText"]) {
									if (GUI.Button(Rect(3, 8, mug.width, mug.height), mug)) {
										line["showText"] = !line["showText"];
										if (__speechOpenTracker.ContainsKey(line["character"])) {
											__speechOpenTracker[line["character"]].Add(line["startPos"]);
										} else {
											var a2:ArrayList = new ArrayList();
											a2.Add(line["startPos"]);
											__speechOpenTracker.Add(line["character"], a2);
										}
									}
								} else {
									var characterName : String = ApplicationState.instance.playStructure["characters"][line["character"]]["name"];
									if (GUI.Button(Rect(3, 8, lineWidth-6, mug.height+5), GUIContent(characterName, mug), mugButtonStyle)) {
										line["showText"] = !line["showText"];
										if (__speechOpenTracker.ContainsKey(line["character"])) {
											__speechOpenTracker[line["character"]].Remove(line["startPos"]);
										} else {
											var a1:ArrayList = new ArrayList();
											__speechOpenTracker.Add(line["character"], a1);
										}
									}
									var textString:String = line["text"];
									var actualTextHeight:float = lineTextStyle.CalcHeight(GUIContent(textString), lineWidth-22);
									if (__scrollViewVector.y >= line["startPos"] && __scrollViewVector.y <= line["endPos"]) {
										// the speech is currently being read
										var difference:float = actualTextHeight - (lineHeight-34);
										if (difference > 0) { // then we need internal scrolling
											var ratio:float = actualTextHeight / (lineHeight-34);
											var currentPosInSpeech:float = __scrollViewVector.y - line["startPos"];
											var newPos:float = currentPosInSpeech * ratio;
											line["scrollPos"].y = newPos - currentPosInSpeech;
										}
									} else if (__scrollViewVector.y <= line["startPos"]) {
										line["scrollPos"].y = 0;
									} else {
										line["scrollPos"].y = actualTextHeight;
									}
									line["scrollPos"] = GUI.BeginScrollView(
										Rect(5, 24, lineWidth-8, lineHeight-34),
										line["scrollPos"], 
										Rect(0, 0, lineWidth-22, actualTextHeight),
										false,
										false
									);
									if (ApplicationState.instance.moveCamera) GUI.Label(Rect(0, 0, lineWidth-22, actualTextHeight), line["text"], lineTextStyle);  
									else line["text"] = GUI.TextArea(Rect(0, 0, lineWidth-22, actualTextHeight), line["text"], lineTextStyle);
									GUI.EndScrollView();
								}
								if (GUI.RepeatButton(Rect(0, lineHeight-8, lineWidth, 8), "", endPosDragStyle)) {
									if (!__doDrag) {
										__dragInfo = {"act": actIndex, "scene": sceneCount, "line": line, "clickY": 0.0, "offset": 0.0, "type": "end"};
										clickPos = Input.mousePosition;
										__dragInfo["clickY"] = Mathf.Abs(clickPos.y - Screen.height) - winRect.y;
										__doDrag = true;
									}
								}
								GUI.EndGroup();
							}

							sceneCount++;
						}
					}
				}
			
				GUI.EndScrollView();
			
				// midway mark
				GUI.DrawTexture(Rect(0, winMiddle+26, winRect.width-15, 1), currentTimeTexture);
				break;
		
			case JUMP_READER_MODE:
				var availableWidth:float = winRect.width - 16; // 16 is scrollbar
		
				__scrollViewVector = GUI.BeginScrollView(
					Rect(0, 26, winRect.width, winRect.height - 45),
					__scrollViewVector,
					Rect(0, 0, availableWidth, __scrollHeight),
					false,
					true
				);
			
				if (__linesLoaded) {
					var prevPos:float = 0.0;
					var startPos:float;
					var endPos:float;
					var headerHeight:float;
					var textHeight:float;
					var testString:String;
					var scrollTo:float;
				
					for (act in ApplicationState.instance.playStructure["acts"]) {
					
						for (var sceneIndex : int in act["scenes"]) {
							scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
						
							testString = act["name"] + ", " + scene["name"];
							headerHeight = actSceneLabelStyle.CalcHeight(GUIContent(testString), availableWidth);
						
							startPos = prevPos;
							endPos = startPos + headerHeight + 9;
							prevPos = endPos;
						
							GUI.Label(Rect(0, startPos, availableWidth+10, headerHeight+5), testString, actSceneLabelStyle);
						
							for (line in scene["lines"]) {
								mug = ApplicationState.instance.playStructure["characters"][line["character"]]["mug"];
							
								testString = ApplicationState.instance.playStructure["characters"][line["character"]]["name"];
								headerHeight = speechStyle.CalcHeight(GUIContent(testString, mug), availableWidth);
							
								testString = line["text"];
								textHeight = lineTextStyle.CalcHeight(GUIContent(testString), availableWidth-12.5);
							
								startPos = prevPos;
								endPos = startPos + headerHeight + textHeight + 10;
								prevPos = endPos;
							
								if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) {
									if (line["startTime"] <= ApplicationState.instance.playTime) scrollTo = startPos;
								}
							
								GUI.BeginGroup(Rect(0, startPos, availableWidth+10, headerHeight+textHeight+10));
							
								GUI.Label(Rect(4, 0, availableWidth, headerHeight), GUIContent(ApplicationState.instance.playStructure["characters"][line["character"]]["name"], mug));
								if (ApplicationState.instance.moveCamera) {
									GUI.Label(Rect(6, headerHeight+4, availableWidth-12.5, textHeight), line["text"], lineTextStyle);  
								} else {
									line["text"] = GUI.TextArea(Rect(6, headerHeight+4, availableWidth-12.5, textHeight), line["text"], lineTextStyle);
								}
							
								GUI.EndGroup();
							}
						}
					}
				
					__scrollHeight = endPos + (winRect.height - (headerHeight + textHeight)*2);
					if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) __scrollViewVector.y = scrollTo;
				}
			
				GUI.EndScrollView();
				break;
			case READER_MODE:
				__scrollViewVector = GUILayout.BeginScrollView(__scrollViewVector, 
				   GUILayout.Width(WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].width), 
				   GUILayout.Height(WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].height - 45)
				);
			
				GUILayout.BeginVertical();

				if (__linesLoaded) {
			
					for (act in ApplicationState.instance.playStructure["acts"]) {
					
						for (var sceneIndex : int in act["scenes"]) {
							scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
						
							GUILayout.Label(act["name"] + ", " + scene["name"], actSceneLabelStyle, GUILayout.Height(21));
						
							for (line in scene["lines"]) {
								mug = ApplicationState.instance.playStructure["characters"][line["character"]]["mug"];
								GUILayout.Label(GUIContent(ApplicationState.instance.playStructure["characters"][line["character"]]["name"], mug));
							
								if (ApplicationState.instance.moveCamera) {
									GUILayout.Label(line["text"], lineTextStyle);  
								} else {
									line["text"] = GUILayout.TextArea(line["text"], lineTextStyle);
								}
							}
						}
					}
				}
			
				GUILayout.EndVertical();
				GUILayout.EndScrollView();
				break;
		}
	
		if ( WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID] ) {
			if(GUI.RepeatButton(Rect(
						winRect.width - resizeWindowButtonSize,
						winRect.height - resizeWindowButtonSize,
						resizeWindowButtonSize,
						resizeWindowButtonSize), 
					resizeWindowButtonTexture,
					resizeWindowButtonStyle)
			) {
				__resizingWindow = true;
				__windowBeingResized = WindowManager.instance.SPEECHES_ID;
				__initialClick = Input.mousePosition;
				__initialRect = winRect;
			}
		}
	
		if ( WindowManager.instance.windowFloat[WindowManager.instance.SPEECHES_ID] ) {
			GUI.DragWindow(Rect(0, 0, 1000000, 30)); // 30 is the height of the window header
			var windowRect : Rect = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID];
		    WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID] = WindowManager.instance.restrictToWindow(windowRect);
		}
		//UpdateToolTip();
		
	}

	private function windowPopOutFunction(windowID: int) {
		var winRect:Rect = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID];


		var toolPos : Rect;
		var styleString :String  = "_POSITION-STYLE_";
		var toolTipPreString : String;
		toolPos = Rect(winRect.width - 60, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		

		var toggleButton:GUIContent = __popOutDisplayMode == READER_MODE ? GUIContent(toggleJumpDisabledButtonTexture, toolTipPreString+"Jumping disabled"):GUIContent(toggleJumpButtonTexture, toolTipPreString+"Jumping enabled");
		if (GUI.Button(toolPos, toggleButton, dragButtonStyle)) {
			if (__popOutDisplayMode == READER_MODE) __popOutDisplayMode = JUMP_READER_MODE;
			else __popOutDisplayMode = READER_MODE;
		}

		toolPos = Rect(winRect.width - 40, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		if (GUI.Button(toolPos, GUIContent(copyButtonTexture, toolTipPreString+"Copy changes"), dragButtonStyle)) {
			createSpeechPositions(true);
		}
		toolPos = Rect(winRect.width - 20, 5, 16, 16);
		toolTipPreString = Rect(toolPos.x + winRect.x, toolPos.y + winRect.y, toolPos.width, toolPos.height) + styleString;
		if (GUI.Button(toolPos, GUIContent(closeButtonTexture, toolTipPreString+"Close window"), dragButtonStyle)) {
			__showPopOut = false;
		}

		var i:int;
		var act:Hashtable;
		var scene:Object;
		var line:Object;
		var mug:Texture2D;
	
		switch (__popOutDisplayMode) {
			case READER_MODE:
				__popOutScrollViewVector = GUILayout.BeginScrollView(__popOutScrollViewVector, 
					GUILayout.Width(WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID].width), 
					GUILayout.Height(WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_POPOUT_ID].height - 45)
				);
			
				GUILayout.BeginVertical();

				if (__linesLoaded) {
			
					for (var actIndex:int = 0; actIndex < ApplicationState.instance.playStructure["acts"].length; actIndex++) {
						act = ApplicationState.instance.playStructure["acts"][actIndex];
					
						var sceneCount:int = 0;
						for (var sceneIndex : int in act["scenes"]) {
							scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
						
							GUILayout.Label(act["name"] + ", " + scene["name"], actSceneLabelStyle, GUILayout.Height(21));
						
							for (i = 0; i < __speechCache[actIndex][sceneCount]["lines"].length; i++) {
								line = __speechCache[actIndex][sceneCount]["lines"][i];
								mug = ApplicationState.instance.playStructure["characters"][line["character"]]["mug"];
								GUILayout.Label(GUIContent(ApplicationState.instance.playStructure["characters"][line["character"]]["name"], mug));  
								// GUILayout.Label(line["text"], lineTextStyle);  
								
								if (ApplicationState.instance.moveCamera) {
									GUILayout.Label(line["text"], lineTextStyle);  									
								} else {
									line["text"] = GUILayout.TextArea(line["text"], lineTextStyle);  
									
									// line["text"] = GUI.TextArea(Rect(6, headerHeight+4, availableWidth-12.5, textHeight), line["text"], lineTextStyle);
								}
								
							}
						}
					}
				}
			
				GUILayout.EndVertical();
				GUILayout.EndScrollView();
			
				break;
			case JUMP_READER_MODE:
				var availableWidth:float = winRect.width - 16; // 16 is scrollbar
		
				__popOutScrollViewVector = GUI.BeginScrollView(
					Rect(0, 26, winRect.width, winRect.height - 45),
					__popOutScrollViewVector,
					Rect(0, 0, availableWidth, __popOutScrollHeight),
					false,
					true
				);
			
				if (__linesLoaded) {
					var prevPos:float = 0.0;
					var startPos:float;
					var endPos:float;
					var headerHeight:float;
					var textHeight:float;
					var testString:String;
					var scrollTo:float;
				
					for (act in ApplicationState.instance.playStructure["acts"]) {
					
						for (var sceneIndex : int in act["scenes"]) {
							scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
						
							testString = act["name"] + ", " + scene["name"];
							headerHeight = actSceneLabelStyle.CalcHeight(GUIContent(testString), availableWidth);
						
							startPos = prevPos;
							endPos = startPos + headerHeight + 9;
							prevPos = endPos;
						
							GUI.Label(Rect(0, startPos, availableWidth+10, headerHeight+5), testString, actSceneLabelStyle);
						
							for (i = 0; i < __speechCache[actIndex][sceneCount]["lines"].length; i++) {
								line = __speechCache[actIndex][sceneCount]["lines"][i];
								mug = ApplicationState.instance.playStructure["characters"][line["character"]]["mug"];
							
								testString = ApplicationState.instance.playStructure["characters"][line["character"]]["name"];
								headerHeight = speechStyle.CalcHeight(GUIContent(testString, mug), availableWidth);
							
								testString = line["text"];
								textHeight = lineTextStyle.CalcHeight(GUIContent(testString), availableWidth-12.5);
							
								startPos = prevPos;
								endPos = startPos + headerHeight + textHeight + 10;
								prevPos = endPos;
							
								if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) {
									if (line["startTime"] <= ApplicationState.instance.playTime) scrollTo = startPos;
								}
							
								GUI.BeginGroup(Rect(0, startPos, availableWidth+10, headerHeight+textHeight+10));

								GUI.Label(Rect(4, 0, availableWidth, headerHeight), GUIContent(line["character"], mug));
								if (ApplicationState.instance.moveCamera) {
									GUI.Label(Rect(6, headerHeight+4, availableWidth-12.5, textHeight), line["text"], lineTextStyle);  
								} else {
									line["text"] = GUI.TextArea(Rect(6, headerHeight+4, availableWidth-12.5, textHeight), line["text"], lineTextStyle);
								}
							
								GUI.EndGroup();
							}
						}
					}
				
					__popOutScrollHeight = endPos + (winRect.height - (headerHeight + textHeight)*2);
					if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) __popOutScrollViewVector.y = scrollTo;
				}
			
				GUI.EndScrollView();
		
				break;
		}
	
		if(GUI.RepeatButton(Rect(
					winRect.width - resizeWindowButtonSize,
					winRect.height - resizeWindowButtonSize,
					resizeWindowButtonSize,
					resizeWindowButtonSize), 
				resizeWindowButtonTexture,
				resizeWindowButtonStyle)
		) {
			__resizingWindow = true;
			__windowBeingResized = WindowManager.instance.SPEECHES_POPOUT_ID;
			__initialClick = Input.mousePosition;
			__initialRect = winRect;
		}
		GUI.DragWindow(Rect(0, 0, 1000000, 30));
	}

	private function getSpeechLength(line:Hashtable): float {
		return ApplicationState.getLineTime(line["text"], line["pace"]);
	}

	private function getPaceFromLine(line:Hashtable): float {	
		var lineLength:float = line["endPos"] - line["startPos"];
		lineLength /= __speechHeightModifyer;
	
		var wordCount:int = line["text"].Split(" "[0]).length;
		var pace:float = lineLength / (ApplicationState.wordTimeLength * wordCount);
	
		return pace;
	}

	private function calculateSpeechWidth() {
		__speechIndent = 20.0;
		__speechOpenWidth = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].width - 16;
	}

	private function createSpeechPositions(updateCache:boolean) {
		__speechPositions = new Array(); // acts
		if (updateCache) __speechCache = new Array();
	
		for (var act : Hashtable in ApplicationState.instance.playStructure["acts"]) {
			__speechPositions.Push(new Array()); // scenes
			if (updateCache) __speechCache.Push(new Array());
		
			for (var sceneIndex : int in act["scenes"]) {
				var scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
			
				var sceneHash:Hashtable = new Hashtable();
				var startPos:float = 0.0;
				if (sceneIndex > 0) startPos = ApplicationState.instance.playStructure["scenes"][sceneIndex - 1]["endTime"];
				sceneHash["startPos"] = startPos * __speechHeightModifyer;
				sceneHash["endPos"] = scene["endTime"] * __speechHeightModifyer;
			
				scene["lines"] = sortLinesForScene(scene["lines"]);

				var colTracker:Array = new Array();
				var i:int;
				var j:int;
				var k:int;
				var line:Object;
				var testLine:Object;
				var lines:Array = new Array();
				for (i = 0; i < scene["lines"].length; i++) {
					line = scene["lines"][i];
					var characterKey:String = line["character"];
				
					line["startPos"] = line["startTime"] * __speechHeightModifyer;
					line["endPos"] = line["startPos"] + getSpeechLength(line) * __speechHeightModifyer;

					// determine what column (indent) to put the line in
					var indent:int = 0;
					var match:boolean = false;
					for (j = 0; j < colTracker.length; j++) {
						if (match) break;
						k = colTracker[j].length - 1;
						testLine = colTracker[j][k]; // should only need to test against the last line in each column
						if (line["startPos"] > testLine["endPos"]) {
							indent = j;
							match = true;
							colTracker[j].Push(line);
							break;
						}
					}
					if (!match) {
						// add a new column
						var a:Array = new Array();
						a.Push(line);
						indent = colTracker.Push(a) - 1;
					}
				
					line["indent"] = indent;
					line["overlap"] = indent+1; // default overlap
				
					line["showText"] = true;
					if (__speechOpenTracker.ContainsKey(characterKey)) {
						if (__speechOpenTracker[characterKey].Contains(line["startPos"])) line["showText"] = true;
					}
					line["scrollPos"] = Vector2.zero;
				
					lines.Push(line);
				}

				if (colTracker.length > 0) {
					// set the overlap (width) for each line
					var testColumn:Array;
					var l:int;
					for (i = colTracker.length-1; i >= 1; i--) {
						column = colTracker[i];
						for (j = 0; j < column.length; j++) {
							line = column[j]; // test each lines against all lines in previous columns
							//~ Debug.Log("tracing "+line["character"]);
							for (k = i - 1; k >= 0; k--) {
								testColumn = colTracker[k];
								for (l = 0; l < testColumn.length; l++) {
									testLine = testColumn[l];
									if (testLine["endPos"] > line["startPos"] && testLine["startPos"] < line["endPos"]) {
										//~ Debug.Log("overlap "+testLine["character"]);
										if (testLine["overlap"] < line["overlap"]) {
											testLine["overlap"] = line["overlap"];
											//~ Debug.Log("setting to "+testLine["overlap"] );
										}
									}
								}
							}
						}
					}
				}
				sceneHash["lines"] = lines;
			
				__speechPositions[__speechPositions.length-1].Push(sceneHash); // lines
				if (updateCache) {
					var tempHash:Hashtable = new Hashtable();
					var tempArray:Array = new Array();
					for (i = 0; i < lines.length; i++) {
						var tempLine:Object = {};
						tempLine["text"] = lines[i]["text"].ToString(); // store a copy of the text
						tempLine["character"] = lines[i]["character"];
						tempLine["startTime"] = lines[i]["startTime"];
						tempArray.Push(tempLine);
					}
					tempHash["lines"] = tempArray;
					__speechCache[__speechCache.length-1].Push(tempHash);
				}
			}
		}
	}

	private function alterSpeechPositions(newInfo:Object) {
		// check if we'll be going lower than the minSpeechHeight
		//~ var lineHeight:float = __dragInfo["line"]["endPos"] - __dragInfo["line"]["startPos"];
		//~ if (lineHeight <= __minSpeechHeight && __dragInfo["offset"] < 0) return;
	
		var match:boolean = false;
		var scene:Object = null;
		for (var act : Hashtable in ApplicationState.instance.playStructure["acts"]) {
			if (match) break;
			for (var sceneIndex : int in act["scenes"]) {
				if (match) break;
				scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
				for (var line in scene["lines"]) {
					if (line["character"] == newInfo["line"]["character"] && line["startTime"] == newInfo["line"]["startTime"]) {
						if (newInfo["type"] == "start") {
							line["startTime"] = (newInfo["line"]["startPos"] + newInfo["offset"]) / __speechHeightModifyer;
						} else {
							newInfo["line"]["endPos"] += newInfo["offset"];
							var newPace:float = getPaceFromLine(newInfo["line"]);
							line["pace"] = newPace;
						}
						match = true;
						break;
					}
				}
			}
		}
	
		newInfo = {};
	}

	private function sortLinesForScene(scene:Array):Array {
		// bubble sort
		var holder:Object;
		for (var i:int = 0; i < scene.length; i++) {
			for (var j:int = 0; j < (scene.length-1); j++) {
				if (scene[j]["startTime"] > scene[j+1]["startTime"]) {
						holder = scene[j+1];
						scene[j+1] = scene[j];
						scene[j] = holder;
				}
			}
		}
		return scene;
	}

	private function findSmallestLineLength():float {
		var minLength:float = 100000;
		var lineLength:float;
		for (var act : Hashtable in ApplicationState.instance.playStructure["acts"]) {
			for (var sceneIndex : int in act["scenes"]) {
				scene = ApplicationState.instance.playStructure["scenes"][sceneIndex];
				for (var line in scene["lines"]) {
					lineLength = getSpeechLength(line);
					if (lineLength < minLength) minLength = lineLength;
				}
			}
		}
		return minLength;
	}

	function Update() {
		if (ApplicationState.instance.speechChanged) {
			createSpeechPositions(true);
			ApplicationState.instance.speechChanged = false;
		}

		if (__resizingWindow) {
			var newHeight : int = __initialRect.height - Input.mousePosition.y + __initialClick.y;
			var newWidth : int = __initialRect.width + Input.mousePosition.x - __initialClick.x;
		
			WindowManager.instance.windowRects[__windowBeingResized].height = newHeight > 40 ? newHeight : 40;
			WindowManager.instance.windowRects[__windowBeingResized].width = newWidth > 40 ? newWidth : 40;		
		
			if (!Input.GetMouseButton(0)) {
				__resizingWindow = false;
			}
		}
	
		if (__doDrag) {
			var mousePos:Vector3 = Input.mousePosition;
			var adjustedPos:float = Mathf.Abs(mousePos.y - Screen.height) - WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].y;
			__dragInfo["offset"] = adjustedPos - __dragInfo["clickY"];
		
			// min startPos is 1
			if (__dragInfo["line"]["startPos"] + __dragInfo["offset"] < 1) {
				__dragInfo["offset"] = 1 - __dragInfo["line"]["startPos"];
			}
	
			if (!Input.GetMouseButton(0)) {
				__doDrag = false;
				alterSpeechPositions(__dragInfo);
				createSpeechPositions(false);
			}
		}
	
		if (__displayMode == BUBBLE_MODE) {
			if (ApplicationState.instance.animate || ApplicationState.instance.scrubberDraged) {
				var currentPosition : float = ApplicationState.instance.playTime * __speechHeightModifyer;
				__scrollViewVector.y = currentPosition;
			} else if (__scrollViewVector != __oldScrollViewVector) { 
				// dragging vertical scroll to move timeline
				//~ var winMiddle:float = (WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].height - 45) * 0.5;
				//~ Debug.Log(__scrollViewVector.y / __speechHeightModifyer + ", " + ApplicationState.instance.playTimeLength);
			
				// don't let scroll move beyond playTimeLength
				if (__scrollViewVector.y / __speechHeightModifyer > ApplicationState.instance.playTimeLength) {
					__scrollViewVector.y = ApplicationState.instance.playTimeLength * __speechHeightModifyer - 0.1;
				}
				// XXX AQUI
				ApplicationState.instance.playTime = __scrollViewVector.y / __speechHeightModifyer;
				__oldScrollViewVector = __scrollViewVector;
			
			}
		}	
	}

	// private function ouputLines() {
	// 	for (var actIndex:int = 0; actIndex < __speechPositions.length; actIndex++) {
	// 		var scenes:Array= __speechPositions[actIndex];
	// 	
	// 		for (var sceneIndex:int = 0; sceneIndex < scenes.length; sceneIndex++) {
	// 			var scene:Hashtable = scenes[sceneIndex];
	// 			Debug.Log("act: "+actIndex+", scene: "+sceneIndex);
	// 			for (var characterEntry in scene["lines"]) {
	// 				var charName:String = characterEntry.Key;
	// 				var lines:Array = characterEntry.Value;
	// 								
	// 				for (var i:int = 0; i < lines.length; i++) {
	// 					var line:Hashtable = lines[i];
	// 					Debug.Log("--- line: "+line["startPos"]+" - "+line["endPos"]);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	public function FinishInitialization() {
		// set the speechHeightModifyer based on the smallest speech
		// it needs to be rendered at least 28 pixels high to be interactive
		var minSpeechLength:float = findSmallestLineLength();
		__speechHeightModifyer = Mathf.Max(28 / minSpeechLength, 30);
	
		__scrollHeight = WindowManager.instance.windowRects[WindowManager.instance.SPEECHES_ID].height;
	
		createSpeechPositions(true);
		__linesLoaded = true;
		__scrollViewVector.y = 0;
		
	}

}