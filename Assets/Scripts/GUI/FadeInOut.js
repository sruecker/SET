

// FadeInOut
//
//--------------------------------------------------------------------
//                        Public parameters
//--------------------------------------------------------------------

public var fadeOutTexture : Texture2D;
public var fadeSpeed = 0.3;

var drawDepth = -1000;

//--------------------------------------------------------------------
//                       Private variables
//--------------------------------------------------------------------

private var __alpha = 1.0; 

private var __fadeDir = -1;

//--------------------------------------------------------------------
//                       Runtime functions
//--------------------------------------------------------------------

//--------------------------------------------------------------------

function OnGUI(){
    
    __alpha += __fadeDir * fadeSpeed * Time.deltaTime;  
    __alpha = Mathf.Clamp01(__alpha);   
    
    GUI.color.a = __alpha;
    
    GUI.depth = drawDepth;
    
    GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), fadeOutTexture);
}

//--------------------------------------------------------------------

function fadeIn(){
    __fadeDir = -1;   
}

//--------------------------------------------------------------------

function fadeOut(){
    __fadeDir = 1;    
}

function Start(){
    __alpha=1;
    fadeIn();
}
 