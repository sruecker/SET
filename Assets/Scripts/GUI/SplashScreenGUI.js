
var gSkin : GUISkin;
var backdrop : Texture2D;
var splashTime : int = 3;
var fadeTime : float = 0.5;


function Update () {
}

function OnGUI () 
{
	
	//Screen.showCursor = false;
	
	if (gSkin)
		GUI.skin = gSkin;
	else 
		Debug.Log("SplashScreenGUI: GUI Skin object is missing !!!");
		
	var backgroundStyle : GUIStyle = new GUIStyle();
	backgroundStyle.normal.background = backdrop;
	
	
	// GUI.Label( Rect( Screen.width /2 - backdrop.width / 2,  	// x
	// 				 Screen.height / 2 - backdrop.height / 2, 	// y
	// 				 backdrop.width, 						// width
	// 				 backdrop.height), 							// height
	// 				 "", backgroundStyle);
	
	

	
	GUI.Label( Rect( 0,  	// x
					 0, 	// y
					 Screen.width, 						// width
					 backdrop.height*Screen.width/backdrop.width), 							// height
					 "", backgroundStyle);
	
	
	if (Time.time > splashTime - fadeTime) {
		CameraFade.FadeOutMain();
	}
	
	if (Time.time > splashTime) {
		Application.LoadLevel(Application.loadedLevel + 1);
	}
	
}


