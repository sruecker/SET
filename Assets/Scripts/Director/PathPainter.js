// #pragma strict
// #pragma implicit
// #pragma downcast

import Drawing;
import ApplicationState;

var AntiAlias : Samples = Samples.Samples4;

private var __tex : Texture2D;
private var __projectorMaterial : Material;

private var __textureSize : int = 2048;
private var __blankPixels : Color[] = new Color[__textureSize*__textureSize];


private var __xMax : float;
private var __zMax : float;
private var __xMin : float;
private var __zMin : float;
private var __lastSceneID : String = "__NO_SCENE__";
private var __currentProjector : Projector;
private var __noPos : Vector2 = Vector2(Mathf.Infinity,0);;

private var __latestDirection : float = 0; 
private var __spaceBetweenDirection : float = 1;

private var __latestStopDirection : float = 0; 

private var __distanceSinceLastStop : float = 0;

function Update()
{

	if (ApplicationState.instance.currentScene != null &&
		(__lastSceneID != ApplicationState.instance.currentScene["id"] || ApplicationState.instance.redrawSurfacePaths)) {
		ApplicationState.instance.redrawSurfacePaths = false;
		paintScenePaths();
		
		__lastSceneID = ApplicationState.instance.currentScene["id"];
	}
}

function startNewPath(newLatestDirection : float) {
	__latestDirection = newLatestDirection;
	__latestStopDirection = newLatestDirection;
}

function redrawUntil(workgCharacter : String, startTime : float)  : Hashtable
{
	var result : Hashtable = new Hashtable();//Vector2 = __noPos;
	result['pos'] = __noPos;
	result['latestDirection'] = 0;
	clearTexture();
	
	// perform actual painting
	
	var playStructure : Hashtable = ApplicationState.instance.playStructure;
	var characters : Hashtable = playStructure["characters"];

	for (var characterKey in characters.Keys) {

		var thisChar : Hashtable = characters[characterKey];
		if ( thisChar["drawPath"] ) {
			var color : Color = thisChar["color"];
		
			// paint each characters destinations
			
			if (ApplicationState.instance.currentScene["destinations"] && 
				ApplicationState.instance.currentScene["destinations"].Contains(characterKey)) {
				var destinationCount : int = ApplicationState.instance.currentScene["destinations"][characterKey].length;
				__latestDirection = 0;
				__latestStopDirection = 0;
				for (var i : int = 0; i < destinationCount; i++) {
					
					if (workgCharacter == characterKey && 
						ApplicationState.instance.currentScene["destinations"][characterKey][i]["endTime"] >= startTime) {
						if (i>1) {
							result["pos"] = Vector2(ApplicationState.instance.currentScene["destinations"][characterKey][i-1]["position"].x,
											 ApplicationState.instance.currentScene["destinations"][characterKey][i-1]["position"].z);
							result["latestDirection"] = __latestDirection;
							if (result["latestDirection"] > 0) {
								result["latestDirection"] -= __spaceBetweenDirection;
							}
						}
							
						break;
					}
		
					if (ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"] != 
						ApplicationState.instance.DISAPPEAR_POS  ) {
					/*
						drawStop(ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].x, 
								 ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].z, 
							     color);
				    */
				
						if (i < destinationCount - 1 && ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"] != 
							ApplicationState.instance.DISAPPEAR_POS) {
							rasterPathWithDirection(ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].x,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].z,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"].x,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"].z,					
									   color);
						}
					}		     
				}
			}
		}
		
	}	
	
	applyChanges();
	return result;
}

function paintScenePaths()
{
	clearTexture();
	
	// perform actual painting
	
	var playStructure : Hashtable = ApplicationState.instance.playStructure;
	var characters : Hashtable = playStructure["characters"];

	for (var characterKey in characters.Keys) {

		var thisChar : Hashtable = characters[characterKey];
		if ( thisChar["drawPath"] ) {
			var color : Color = thisChar["color"];
		
			// paint each characters destinations
			
			if (ApplicationState.instance.currentScene["destinations"] && 
				ApplicationState.instance.currentScene["destinations"].Contains(characterKey)) {
				var destinationCount : int = ApplicationState.instance.currentScene["destinations"][characterKey].length;
				__latestDirection = 0;
				__latestStopDirection = 0;
				for (var i : int = 0; i < destinationCount; i++) {
		
					if (ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"] != 
						ApplicationState.instance.DISAPPEAR_POS  ) {
					/*
						drawStop(ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].x, 
								 ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].z, 
							     color);
				    */
				
						if (i < destinationCount - 1 && ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"] != 
							ApplicationState.instance.DISAPPEAR_POS) {
							rasterPathWithDirection(ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].x,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i]["position"].z,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"].x,
									   ApplicationState.instance.currentScene["destinations"][characterKey][i+1]["position"].z,					
									   color);
						}
					}		     
				}
			}
		}
		
	}	
	
	applyChanges();
}

function applyChanges() {
	// apply changes
	
	__tex.filterMode = FilterMode.Bilinear;
	__tex.anisoLevel = 2;
	
    __tex.Apply();

	// set the new texture
	__projectorMaterial = __currentProjector.material;
	__projectorMaterial.SetTexture("_ShadowTex", __tex);
}


function clearTexture()
{    
    __tex.SetPixels(__blankPixels, 0);
	applyChanges();
    
}


function Awake()
{
	var pixelCount : int = __textureSize*__textureSize;
	for (var i : int = 0; i < pixelCount; i++) {
		__blankPixels[i] = Color.white;
	}
	
}

function FinishInitialization() {

	
		
	__tex = new Texture2D(__textureSize, __textureSize, TextureFormat.RGB24, false);
	__tex.wrapMode = TextureWrapMode.Clamp;
	// get projection area
	
	__currentProjector = GameObject.Find("StagePathProjector").GetComponent(Projector);
	
	__xMax = __currentProjector.transform.position.x + __currentProjector.orthographicSize;
	__zMax = __currentProjector.transform.position.z + __currentProjector.orthographicSize;
	__xMin = __currentProjector.transform.position.x - __currentProjector.orthographicSize;
	__zMin = __currentProjector.transform.position.z - __currentProjector.orthographicSize;
	
	
	clearTexture();
   

	Drawing.NumSamples=AntiAlias;
	

}

private function posToTextureCoordinates(x_ : float, y_ : float) : Vector2
{
	
	
	return Vector2( Mathf.Floor(((x_ - __xMin) / (__xMax - __xMin)) * __textureSize),
					Mathf.Floor(((y_ - __zMin) / (__zMax - __zMin)) * __textureSize));
					
}

function drawStop(xPos : float, yPos : float, color : Color)
{
	
	var firstVal : float = 4;// 8
	var secondVal : float = 1;// 5
	__tex = Drawing.Paint(posToTextureCoordinates(xPos, yPos), firstVal, color, secondVal, __tex);
}



// from wikipedia

private function rasterCircle(xPos : float, yPos : float, radius : float, color : Color)
{
	var f : int = 1 - radius;
	var ddF_x : int = 1;
	var ddF_y : int = -2 * radius;
	var x : int = 0;
	var y : int = radius;
	
	__tex.SetPixel(xPos, yPos + radius, color);
	__tex.SetPixel(xPos, yPos - radius, color);
	__tex.SetPixel(xPos + radius, yPos, color);
	__tex.SetPixel(xPos - radius, yPos, color);
	
	while(x < y) {
	 // ddF_x == 2 * x + 1;
	 // ddF_y == -2 * y;
	 // f == x*x + y*y - radius*radius + 2*x - y + 1;
	 if(f >= 0) {
	   y--;
	   ddF_y += 2;
	   f += ddF_y;
	 }
	 x++;
	 ddF_x += 2;
	 f += ddF_x;    
	 __tex.SetPixel(xPos + x, yPos + y, color);
	 __tex.SetPixel(xPos - x, yPos + y, color);
	 __tex.SetPixel(xPos + x, yPos - y, color);
	 __tex.SetPixel(xPos - x, yPos - y, color);
	 __tex.SetPixel(xPos + y, yPos + x, color);
	 __tex.SetPixel(xPos - y, yPos + x, color);
	 __tex.SetPixel(xPos + y, yPos - x, color);
	 __tex.SetPixel(xPos - y, yPos - x, color);
	}
}

// change to get coords already to texture coordinates

private function rasterLine(xFrom : float, yFrom: float, xTo: float, yTo: float, color : Color)
{
	
	
	var from : Vector2 = Vector2 (xFrom, yFrom);
	var to : Vector2 = Vector2 (xTo, yTo);
	
	var xStep : float = xTo - xFrom;
	var yStep : float = yTo - yFrom;
	
	var stepSize : float = 0.009;
	
	var lineLength : float = Mathf.Sqrt( Mathf.Pow( xStep, 2.0) + Mathf.Pow( yStep, 2.0) );
	
	xStep /= lineLength;
	yStep /= lineLength;
	
	for (var step : float = 0; step < lineLength; step += stepSize) {
		
		var xCoord : float = xFrom + xStep * step;
		var yCoord : float = yFrom + yStep * step;
		
		
		__tex = Drawing.Paint(posToTextureCoordinates(xCoord, yCoord), 3, color, 5, __tex);
	}	
}

function rasterPathWithDirection(xFrom : float, yFrom: float, xTo: float, yTo: float, color : Color)
{
	
	var xStep : float = xTo - xFrom;
	var yStep : float = yTo - yFrom;
	
	var stepSize : float = __spaceBetweenDirection;
	var stopStepSize : float = __spaceBetweenDirection;
	
	var lineLength : float = Mathf.Sqrt( Mathf.Pow( xStep, 2.0) + Mathf.Pow( yStep, 2.0) );
	
	xStep /= lineLength;
	yStep /= lineLength;
	
	var firstVal : float = 1; //2
	var secondVal : float = 1; // 5
	
	__tex = Drawing.PaintLine(posToTextureCoordinates(xFrom, yFrom), 
							  posToTextureCoordinates(xTo, yTo), 
							  firstVal, color, secondVal, __tex);
							  

	for (var step : float = __latestDirection + stepSize; step < lineLength; step += stepSize) {
		
		var xPerp : float = -1.0 * yStep /2.0;
		var yPerp : float = xStep / 2.0;
		var xCenterPosition : float = xFrom + xStep * step;
		var yCenterPosition : float = yFrom + yStep * step;
		
		__tex = Drawing.PaintLine(
					posToTextureCoordinates(xCenterPosition + xPerp * 0.15 - xStep * 0.1, 
											yCenterPosition + yPerp * 0.15 - yStep * 0.1),
					posToTextureCoordinates(xCenterPosition, 
											yCenterPosition), 
					firstVal, color, secondVal, __tex);
		
		__tex = Drawing.PaintLine(
					posToTextureCoordinates(xCenterPosition - xPerp * 0.15 - xStep * 0.1, 
											yCenterPosition - yPerp * 0.15 - yStep * 0.1),
					posToTextureCoordinates(xCenterPosition, 
											yCenterPosition), 
					firstVal, color, secondVal, __tex);

	}

	__latestDirection = step - lineLength - stepSize;


	for (step = __latestStopDirection + stepSize; step < lineLength; step += stepSize/2) {	
		xPerp  = 1.0 * yStep /2.0;
		yPerp  = xStep / 2.0;
		xCenterPosition = xFrom + xStep * step;
		yCenterPosition  = yFrom + yStep * step;
		drawStop(xCenterPosition, yCenterPosition, color);		
	}

	
	__latestStopDirection = step - lineLength - stepSize;	

	
}



