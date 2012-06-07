
import ApplicationState;


static var instance : WindowManager;

static var 		windowRects : Array;
static private var __windowRectsCache : Array;
static var 		windowUpdate : Array;
static var 		windowFloat : Hashtable; 		
static var 		lineRects : Hashtable;
static var		showMiniMap : boolean;
static var		showYawRing : boolean;


static private var __initialCharacterWidth ;
static private var __initialAnnotationWidth ;
static private var __initialSpeechesWidth;

static private var __panelGroupMainPanelsIds : Array;
static private var __panelGroupNextIds : Array;
static private var __panelGroupInitIds : Array;

static private var __minWindowWidth ;
static private var __bottomWindowHeight : float; 
static private var __initBottomWindowHeight : float; 
static private var __windowIdPool : Array;
static private var __maxIdCount : int;

static var	SUBCONTROLS_ID : int;
static var	CAMCONTROLS_ID : int;
static var  MINIMAP_ID : int;
static var  TIMELINE_ID : int;
static var	CHARACTER_ID : int;
static var	ONSTAGE_ID : int;
static var	ANNOTATIONS_ID : int;
static var	SPEECHES_ID : int;
static var	SPEECHES_POPOUT_ID : int;
static var	FILEBROWSER_ID: int;
static var	MESSENGER_ID : int;
static var 	TOOLBAR_ID : int;
static var  TOOLBAR_MENU_ID : int;
static var  TOOLTIP_ID : int;
static var  CHARACTER_MENU_1_ID : int;
static var  CHARACTER_MENU_2_ID : int;
static var  REAL_TIME_MAP_ID : int;
static var  CHARACTERCONTROLS_ID : int;
static var  ANNOTATIONS_TEXTURES_ID : int;
static var  ANNOTATIONS_TEXTURES_MENU_ID : int;
static var  ADD_ANNOTATION_ID : int;
static var  CHARACTERCONTROLS_SUB_ID : int;
static var	LAST_ID : int;

static var	UNDOCKING_JUMP : int;

static var windowGroups:Hashtable;

private static var timeLineWindowControl : TimeLineWindowControl;

instance = FindObjectOfType(WindowManager);

if (instance == null) {
    Debug.Log ("Could not locate an WindowManager object. You have to have exactly one WindowManager in the play.");
}

 // Ensure that the instance is destroyed when the game is stopped in the editor.
function OnApplicationQuit() 
{
    instance = null;
}

static function isWindowClicked(mouseCoords : Vector2, area : Rect) {
	
	if (mouseCoords.x >= area.x &&
		mouseCoords.x <= area.x + area.width &&
		Screen.height - mouseCoords.y >= area.y &&
		Screen.height - mouseCoords.y <= area.y + area.height
		) {
		return true;		
	}
	
	return false;
}


function Awake()
{
	
	__bottomWindowHeight     = 250; 
	__initBottomWindowHeight = __bottomWindowHeight;
	__initialCharacterWidth  = 200;
	__initialAnnotationWidth = 207;
	__initialSpeechesWidth   = 200;
	__minWindowWidth         = 170;
	__maxIdCount			 = 100;

	windowGroups = new Hashtable();
	windowGroups["floating"] = new Hashtable();
	windowGroups["anchored"] = new Hashtable();
	lineRects = new Hashtable();
	showMiniMap = true;
	showYawRing = true;
	
	
	SUBCONTROLS_ID      = 22;
	windowGroups["floating"][SUBCONTROLS_ID] = "Sub controls";
	CAMCONTROLS_ID      = 2;
	windowGroups["floating"][CAMCONTROLS_ID] = "Camera controls";
	MINIMAP_ID          = 3;
	windowGroups["floating"][MINIMAP_ID] = "Minimap";
	TIMELINE_ID         = 4;
	windowGroups["anchored"][TIMELINE_ID] = "Timeline";
	CHARACTER_ID        = 5;
	windowGroups["anchored"][CHARACTER_ID] = "Characters";
	ONSTAGE_ID          = 6;
	windowGroups["anchored"][ONSTAGE_ID] = "On stage";
	ANNOTATIONS_ID      = 7;
	windowGroups["anchored"][ANNOTATIONS_ID] = "Annotations";
	SPEECHES_ID         = 8;
	windowGroups["anchored"][SPEECHES_ID] = "Speech";
	SPEECHES_POPOUT_ID  = 9;
	windowGroups["floating"][SPEECHES_POPOUT_ID] = "Speech popout";
	FILEBROWSER_ID      = 10;
	MESSENGER_ID        = 11;
	TOOLBAR_ID          = 12;
	TOOLBAR_MENU_ID     = 13;
	TOOLTIP_ID          = 14;
	CHARACTER_MENU_1_ID = 15;
	CHARACTER_MENU_2_ID = 16;
	REAL_TIME_MAP_ID	= 17;
	CHARACTERCONTROLS_ID = 18;
	CHARACTERCONTROLS_SUB_ID = 19;
	ANNOTATIONS_TEXTURES_ID = 20;
	windowGroups["anchored"][ANNOTATIONS_TEXTURES_ID] = "Annotation textures";
	windowGroups["floating"][REAL_TIME_MAP_ID] = "Realtime map";
	ANNOTATIONS_TEXTURES_MENU_ID = 21;
	ADD_ANNOTATION_ID = 1;
	LAST_ID             = 23;
	
	UNDOCKING_JUMP  = 10;
	
	windowRects  = new Array();
	__windowRectsCache = new Array();
	windowUpdate = new Array();
	
	__panelGroupMainPanelsIds = new Array();
	windowFloat = new Hashtable();
	__panelGroupNextIds       = new Array();
	__panelGroupInitIds		  = new Array();	
	
	
	__panelGroupMainPanelsIds.push(CHARACTER_ID);
	__panelGroupMainPanelsIds.push(ONSTAGE_ID);
	__panelGroupMainPanelsIds.push(ANNOTATIONS_ID);
	__panelGroupMainPanelsIds.push(SPEECHES_ID);
	
	windowFloat.Add(ANNOTATIONS_ID, false);
	windowFloat.Add(SPEECHES_ID, false);
	
	
	__panelGroupNextIds[CHARACTER_ID]   = ONSTAGE_ID;
	__panelGroupNextIds[ONSTAGE_ID]     = ANNOTATIONS_ID;
	__panelGroupNextIds[ANNOTATIONS_ID] = SPEECHES_ID;
	__panelGroupNextIds[SPEECHES_ID]    = LAST_ID;

	__panelGroupInitIds = __panelGroupNextIds.slice(0);
	
	var initialYPos : int = Screen.height - __bottomWindowHeight;
	var onStageInitialWidth : int = Screen.width - __initialCharacterWidth - __initialAnnotationWidth - __initialSpeechesWidth;
	
	for (var i : int = 0; i < LAST_ID; i++) {
		windowRects.push(Rect(0,0,0,0));
		windowUpdate.push(false);
	}
	
	windowRects[SUBCONTROLS_ID]               = Rect(20, 40, 34, 180); // 127
	windowRects[CHARACTERCONTROLS_ID]         = Rect(20, 40, 34, 61); // 127
	windowRects[CHARACTERCONTROLS_SUB_ID]     = Rect(20, 40, 100, 34);
	windowRects[CAMCONTROLS_ID]               = Rect(0,0,0,0);//Rect(20, 190, 128, 163);
	windowRects[MINIMAP_ID]                   = Rect(0,0,0,0);//Rect(Screen.width - 210, __bottomWindowHeight - 169, 0, 0);
	windowRects[ANNOTATIONS_TEXTURES_ID]      = Rect(Screen.width - 210, __bottomWindowHeight - 169, 200, 150);
	windowRects[ANNOTATIONS_TEXTURES_MENU_ID] = Rect(Screen.width - 210, __bottomWindowHeight - 169, 200, 150);
	
	windowRects[TIMELINE_ID]                  = Rect(0, Screen.height - __bottomWindowHeight -85, Screen.width, 90);
	windowRects[CHARACTER_ID]                 = Rect(0, initialYPos, __initialCharacterWidth, __bottomWindowHeight);
	windowRects[ONSTAGE_ID]                   = Rect(__initialCharacterWidth, initialYPos, onStageInitialWidth, __bottomWindowHeight);
	windowRects[ANNOTATIONS_ID]               = Rect(__initialCharacterWidth + onStageInitialWidth, initialYPos, __initialAnnotationWidth, __bottomWindowHeight);
	windowRects[SPEECHES_ID]                  = Rect(__initialCharacterWidth + onStageInitialWidth + __initialAnnotationWidth, initialYPos, __initialSpeechesWidth, __bottomWindowHeight);
	windowRects[SPEECHES_POPOUT_ID]           = Rect(__initialCharacterWidth + onStageInitialWidth + __initialAnnotationWidth, initialYPos - __bottomWindowHeight, __initialSpeechesWidth, __bottomWindowHeight);
	
	windowRects[MESSENGER_ID]                 = Rect(20,20,50,50);
	windowRects[TOOLBAR_ID]                   = Rect(0,0,Screen.width,22);
	windowRects[TOOLBAR_MENU_ID]              = Rect(0,22,80,100);
	windowRects[TOOLTIP_ID]                   = Rect(0,0,0,0);
	windowRects[CHARACTER_MENU_1_ID]          = Rect(0,0,0,0);
	windowRects[CHARACTER_MENU_2_ID]          = Rect(0,0,0,0);
	windowRects[REAL_TIME_MAP_ID]             = Rect(150, 20, 200, 200+25);
	windowRects[FILEBROWSER_ID]				  = Rect(Screen.width / 2 - 185,35,370,50);
	windowRects[ADD_ANNOTATION_ID]			  = Rect(Screen.width / 2 - 185,35,370,270);
	
	__windowIdPool = Array();
	
	for (i = 0; i < __maxIdCount; i++) {
		__windowIdPool.Push(LAST_ID + i);
	}
	
	timeLineWindowControl = GameObject.Find("TimeLineWindow").GetComponent(TimeLineWindowControl);
}

static function reserveId() : int {
	return __windowIdPool.Pop();
}

static function releaseId( id : int) {
	__windowIdPool.Push(id);
}

static function restoreWindow(winId:int) {
	var i:int;
	
	__bottomWindowHeight = __initBottomWindowHeight;
	
	if (winId >= 0) {
		windowRects[winId] = __windowRectsCache[winId];
	} else if (winId == -1) {
		for (i = 0; i < __windowRectsCache.length; i++) {
			if (__windowRectsCache[i] != null && windowGroups["anchored"][i] != null) {
				windowRects[i] = __windowRectsCache[i];
			}
		}
	} else if (winId == -2) {
		for (i = 0; i < __windowRectsCache.length; i++) {
			if (__windowRectsCache[i] != null) {
				windowRects[i] = __windowRectsCache[i];
			}
		}
	}
	if (winId == TIMELINE_ID || winId < 0) {
		// XXX check why the timeline windowRectCache is apparently being modified 
		// windowRects[TIMELINE_ID].y = Screen.height - __bottomWindowHeight - 85;
		// setBottomWindowHeight(Screen.height - __bottomWindowHeight);		
		// GameObject.Find("TimeLineWindow").GetComponent(TimeLineWindowControl).setScrubberPositions();
		timeLineWindowControl.resetBottomWindow(Screen.height - __bottomWindowHeight);
		
	}
	if (winId == ANNOTATIONS_ID || winId < 0) {
		if (windowFloat[ANNOTATIONS_ID]) {
			windowFloat[ANNOTATIONS_ID] = false;
			dock(ANNOTATIONS_ID);
		}
	}
	if (winId == SPEECHES_ID || winId < 0) {
		if (windowFloat[SPEECHES_ID]) {
			windowFloat[SPEECHES_ID] = false;
			dock(SPEECHES_ID);
		}
	}
}

// FIXME change window width by hand is not working right now
static function changeWindowWidth(windowID : int, newWidth : int) {
	
	if (windowID == CHARACTER_ID ||
		windowID == ONSTAGE_ID   ||
		windowID == ANNOTATIONS_ID ) {
	
		if (newWidth < __minWindowWidth) {
			newWidth = __minWindowWidth;

		}
	
		var nextId : int = __panelGroupNextIds[windowID];
		var changeBy : int = windowRects[windowID].width - newWidth;
		
		if(nextId != LAST_ID) {
			var nextWidth : int = windowRects[nextId].width + changeBy;
			if (nextWidth < __minWindowWidth) {
				var diffToMin : int = __minWindowWidth - nextWidth;
				changeBy += diffToMin;
				newWidth -= diffToMin;
			}		
		}
	
		windowRects[windowID].width = newWidth;
	
		if(nextId != LAST_ID) {
			windowRects[nextId].x = windowRects[nextId].x - changeBy;
			windowRects[nextId].width = windowRects[nextId].width + changeBy;
		}
		
	}
	 		
}

// static public function resetPanelWindow(windowID : int) 
// {
// 	switch(windowID) {
// 		case SPEECHES_ID:
// 			windowRects[SPEECHES_ID].x = windowRects[ANNOTATIONS_ID].x + 
// 										 windowRects[ANNOTATIONS_ID].width;
// 			windowRects[SPEECHES_ID].y = Screen.height - __bottomWindowHeight;
// 			windowRects[SPEECHES_ID].width = Screen.width - 
// 											 windowRects[CHARACTER_ID].width -
// 											 windowRects[ONSTAGE_ID].width -
// 											 windowRects[ANNOTATIONS_ID].width;
// 			windowRects[SPEECHES_ID].height = __bottomWindowHeight;
// 					
// 			break;
// 	}
// }



static function dock(windowId : int){
	
	// move onstage around
	
	var remainingWidth : int = Screen.width - windowRects[CHARACTER_ID].width;

	
	
	for (var floatingWindowId : int in windowFloat.Keys) {
		if ( ! windowFloat[floatingWindowId]) {
			remainingWidth -= windowRects[floatingWindowId].width;
		}
	}
	
	if (remainingWidth < __minWindowWidth) { // make changes
		var widthNeeded : int = __minWindowWidth - remainingWidth;
		remainingWidth = __minWindowWidth;
		windowRects[windowId].width -= widthNeeded;
	} 
	
	// set next

	for (var i=0; i < __panelGroupInitIds.length; i++) {
		if (__panelGroupInitIds[i] == windowId) {
			
			var found : boolean = false;
			while (!found) {
				for (var j:int =0 ; j< __panelGroupNextIds.length; ++j) {
					if (__panelGroupNextIds[j] == i) {
						found = true;
					}
				}
				if (!found) {
					--i;
				}
			}
					
			__panelGroupNextIds[windowId] = __panelGroupNextIds[i];
			__panelGroupNextIds[i] = windowId;
			break;
		}
	}
	
	//__panelGroupNextIds[windowId] = __panelGroupInitIds[windowId];

	
	windowRects[ONSTAGE_ID].width = remainingWidth;
	remainingWidth += windowRects[CHARACTER_ID].width;
	
	var nextId : int = __panelGroupNextIds[ONSTAGE_ID];
	
	while (nextId != LAST_ID) {

		windowRects[nextId].x = remainingWidth;
		windowRects[nextId].y = Screen.height - __bottomWindowHeight;
		windowRects[nextId].height = __bottomWindowHeight;

		remainingWidth += windowRects[nextId].width;
		nextId = __panelGroupNextIds[nextId];
	}
	
	windowUpdate[ONSTAGE_ID] = true;
	
	
}

static function undock(windowId : int){
	windowRects[windowId].x -= UNDOCKING_JUMP;
	windowRects[windowId].y -= UNDOCKING_JUMP;
	

	
	
	for (var i : int = 0; i < __panelGroupNextIds.length; i++ ) {
		if (__panelGroupNextIds[i] == windowId) {
			__panelGroupNextIds[i] = __panelGroupNextIds[windowId];
			__panelGroupNextIds[windowId] = LAST_ID;
			break;
		}
	}
	

	__panelGroupNextIds[windowId] = LAST_ID;
	
	if (__panelGroupNextIds[ONSTAGE_ID] == LAST_ID) {
		windowRects[ONSTAGE_ID].width = Screen.width - windowRects[CHARACTER_ID].width + 7; // hide unused resize button area
	} else { // manage remaining windows
		// right now there can be only one more window so lets simplify this
	
		var newOnStageWidth : int = Screen.width - 
		 							windowRects[CHARACTER_ID].width - 
		 							windowRects[__panelGroupNextIds[ONSTAGE_ID]].width;
		 							
		//changeWindowWidth(ONSTAGE_ID, newOnStageWidth);
		windowRects[ONSTAGE_ID].width = newOnStageWidth;
		windowRects[__panelGroupNextIds[ONSTAGE_ID]].x = windowRects[CHARACTER_ID].width +
														 newOnStageWidth;
		
	}
	
	windowUpdate[ONSTAGE_ID] = true;
	
}

static public function isLastWindowOnPanels(windowId : int)
{
	return __panelGroupNextIds[windowId] == LAST_ID;
}

static public function getBottomWindowHeight() : float
{
	
	return __bottomWindowHeight;
}

static public function setBottomWindowHeight(newHeight : float)
{
	
	if (newHeight<0) {
		newHeight = 0;
	}
	
	// Debug.Log(newHeight + " "  + Screen.height - windowRects[TOOLBAR_ID].height);
	
	if (newHeight > Screen.height - windowRects[TOOLBAR_ID].height - 85) {
		newHeight = Screen.height - windowRects[TOOLBAR_ID].height - 85;
	}
	
	__bottomWindowHeight = newHeight;
	
	var yPos : float = Screen.height - newHeight;
	
	if ( __bottomWindowHeight < 100) {
		__bottomWindowHeight = 100;
	}

	// if (__bottomWindowHeight > Screen.height - windowRects[TOOLBAR_ID].height) {
	// 	__bottomWindowHeight = Screen.height - windowRects[TOOLBAR_ID].height;
	// }
	
	
		
	windowRects[TIMELINE_ID].y         = yPos - 85;    
	
	for (var windowId : int in __panelGroupMainPanelsIds) {
		
		if ( ! windowFloat.Contains(windowId) || ! windowFloat[windowId]) {
			windowRects[windowId].height   = __bottomWindowHeight;  
			windowRects[windowId].y        = yPos;  
		}
	}

	
}

static public function cacheWindows() {

	__windowRectsCache[SUBCONTROLS_ID]          = windowRects[SUBCONTROLS_ID];
	__windowRectsCache[CAMCONTROLS_ID]          = windowRects[CAMCONTROLS_ID];
	__windowRectsCache[MINIMAP_ID]              = windowRects[MINIMAP_ID];
	__windowRectsCache[ANNOTATIONS_TEXTURES_ID] = windowRects[ANNOTATIONS_TEXTURES_ID];
	__windowRectsCache[TIMELINE_ID]             = windowRects[TIMELINE_ID];
	__windowRectsCache[CHARACTER_ID]            = windowRects[CHARACTER_ID];
	__windowRectsCache[ONSTAGE_ID]              = windowRects[ONSTAGE_ID];
	__windowRectsCache[ANNOTATIONS_ID]          = windowRects[ANNOTATIONS_ID];
	__windowRectsCache[SPEECHES_ID]             = windowRects[SPEECHES_ID];
	__windowRectsCache[SPEECHES_POPOUT_ID]      = windowRects[SPEECHES_POPOUT_ID];
	__windowRectsCache[REAL_TIME_MAP_ID]        = windowRects[REAL_TIME_MAP_ID];

}

static public function restrictToViewPort(windowRect:Rect) : Rect{
	if (windowRect.x <=0) windowRect.x = 0;				
	if (windowRect.y <=windowRects[TOOLBAR_ID].height) windowRect.y = windowRects[TOOLBAR_ID].height;
	if (windowRect.x >=Screen.width - windowRect.width) windowRect.x = Screen.width - windowRect.width;				
	if (windowRect.y >=windowRects[TIMELINE_ID].y - windowRect.height) windowRect.y = windowRects[TIMELINE_ID].y - windowRect.height;
	
	return windowRect;
}

static public function restrictToWindow(windowRect:Rect) : Rect {
	if (windowRect.x <=0) windowRect.x = 0;				
	if (windowRect.y <=windowRects[TOOLBAR_ID].height) windowRect.y = windowRects[TOOLBAR_ID].height;
	if (windowRect.x >=Screen.width - windowRect.width) windowRect.x = Screen.width - windowRect.width;				
	if (windowRect.y >= Screen.height - windowRect.height) windowRect.y = Screen.height - windowRect.height;
	
	return windowRect;
}

static public function isMouseOnScreen(mousePos : Vector3) : boolean {
	if (mousePos.x < 0) return false;
	if (mousePos.y < 0) return false;
	if (mousePos.x > Screen.width) return false;
	if (mousePos.y > Screen.height) return false;
	return true;
}



