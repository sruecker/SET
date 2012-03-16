
import ApplicationState;

private var __area : Rect;

//private var thisScruber : GameObject;

private var __pointerSize : int = 15;
private var __timeBackgroundWidth : int = 65;
private var __timeBackgroundHeight : int = 23;


//private var __scruberFrameObject : Transform;
//private var __scruberPointerObject: Transform;
//private var __scrubberTimeBackground: Transform;

private var __slider : HorizontalSlideBehaviour;
private var __scruberFrameTextureControl : TextureControl;
private var __scruberPointerTextureControl: TextureControl;
private var __scruberTimeTextTextControl : TextControl;
private var __scruberTimeBackgroundTextureControl : TextureControl;
private var __lightingLeftTextureControl: TextureControl;
private var __lightingRightTextureControl: TextureControl;

private var __previousTime : float = 0;
// copied from TimeLineView, this should be placed on the application state 
private var __startTimeLineAtX : int = 50;



function Awake()
{
	
	var scruberFrameObject : Transform = transform.Find("ScruberFrame");
	var scruberPointerObject : Transform = transform.Find("ScruberPointer");
	var scruberTextObject : Transform = transform.Find("ScruberTimeText");
	var scruberTimeBackgroundObject : Transform = transform.Find("ScruberTimeBackground");
	
	__slider = scruberFrameObject.GetComponent(HorizontalSlideBehaviour);
	
	__scruberFrameTextureControl = scruberFrameObject.GetComponent(TextureControl);
	__scruberPointerTextureControl = scruberPointerObject.GetComponent(TextureControl);
	__scruberTimeTextTextControl = scruberTextObject.GetComponent(TextControl);
	__scruberTimeBackgroundTextureControl = scruberTimeBackgroundObject.GetComponent(TextureControl);
	
	
	__lightingLeftTextureControl = transform.Find("TimeLineLighting/TimeLineLightingLeft").GetComponent(TextureControl);
	__lightingRightTextureControl = transform.Find("TimeLineLighting/TimeLineLightingRight").GetComponent(TextureControl);
	
	__scruberTimeTextTextControl.setColor(Color.black);
	__scruberTimeTextTextControl.setAlignment(TextAlignment.Center);
}

function Start()
{
	setArea(Rect (0, Screen.height - 85 - WindowManager.instance.getBottomWindowHeight(), 100, 38));

	setSliderMaxMin(Screen.width - getMiddle(), __startTimeLineAtX - getMiddle());	
	setX( Mathf.Floor( __startTimeLineAtX ) );
}


function Update()
{

	 
	var workingArea : int = Screen.width - __startTimeLineAtX;
	
	if ( ! __slider.isMouseDown() ) {
					
			// calculate new position		
			
			var currentPosition : float = (ApplicationState.instance.playTime * workingArea / ApplicationState.instance.playTimeLength) + __startTimeLineAtX - getMiddle();
			
			__slider.xMov = Mathf.Floor( currentPosition ) ;
			ApplicationState.instance.scrubberDraged = false;
		//}
	} else {
		
		// set playtime, __slider.xMov is being changed by the slider behaviour

		ApplicationState.instance.playTime = __slider.xMov * ApplicationState.instance.playTimeLength / workingArea;
		ApplicationState.instance.playingForward = ApplicationState.instance.playTime > __previousTime;
		__previousTime = ApplicationState.instance.playTime;
		ApplicationState.instance.scrubberDraged = true;
		
	}
	
	__scruberFrameTextureControl.setX( __slider.xMov );
	__scruberPointerTextureControl.setX(__slider.xMov + getPointerXPos() );
	__scruberTimeTextTextControl.setX(__slider.xMov + __area.width / 2);
	__scruberTimeBackgroundTextureControl.setX(__slider.xMov + getTimeBackgroundXPos());
	
	setScruberTime();
	
	
	var newLeftLightingWidth : int = __slider.xMov - __startTimeLineAtX;
	
	if (Mathf.Sign(newLeftLightingWidth) == 1) { 
		__lightingLeftTextureControl.setWidth(newLeftLightingWidth);
	} else {
		__lightingLeftTextureControl.setWidth(0);	
	}
	
	__lightingRightTextureControl.setX(__slider.xMov + __area.width);
	
}


function setArea( area_ : Rect ) {
	__area = area_;
	__scruberFrameTextureControl.setArea(__area);
	__scruberPointerTextureControl.setArea( Rect( __area.x  , __area.y + 22,16 , 16));
	__scruberTimeTextTextControl.setX(__area.x);
	__scruberTimeTextTextControl.setY(__area.y - __timeBackgroundHeight + 10);
	__scruberTimeBackgroundTextureControl.setArea(Rect( __area.x  , 
														__area.y - __timeBackgroundHeight + 5 ,  
														__timeBackgroundWidth, 
														__timeBackgroundHeight));
	
	var lightingArea : Rect = __area;
	lightingArea.width = 1;
	
	__lightingLeftTextureControl.setArea(__area);
	__lightingLeftTextureControl.setWidth(1);
	__lightingLeftTextureControl.setX(__startTimeLineAtX);
	
	__lightingRightTextureControl.setArea(__area);
	__lightingRightTextureControl.setWidth(Screen.width);

	
}

public function setX( x_ : int)
{
	__slider.xMov = x_;
	//__scruberFrameTextureControl.setX(x_);
	//__scruberPointerTextureControl.setX(x_ + getPointerXPos());
}

public function setWidth( width_ : int )
{
	Debug.Log("setWidth is not implemented");
}


public function getMiddle()
{
	return  __area.width / 2;
}


public function getPointerXPos() : int
{
	return ( __area.width / 2 - __pointerSize / 2);
	
}

public function getTimeBackgroundXPos() : int
{
	return ( __area.width / 2 - __timeBackgroundWidth / 2);
}

public function setSliderMaxMin(max_ : int , min_ : int )
{
	__slider.maxHorizontal = max_;
	__slider.minHorizontal = min_;
	
	
}

private function setScruberTime()
{
	var currentTime : float = ApplicationState.instance.playTime;
	
	var hours : int = currentTime / 3600;
	currentTime -= hours * 3600;
	var minutes : int = currentTime / 60;
	currentTime -= minutes * 60;
	var seconds : int = currentTime;
	
	var hString : String = hours < 10 ? "0" + hours.ToString() : hours.ToString();
	var mString : String = minutes < 10 ? "0" + minutes.ToString() : minutes.ToString();
	var sString : String = seconds < 10 ? "0" + seconds.ToString() : seconds.ToString();
	
	
	__scruberTimeTextTextControl.setText(hString + ":" + mString + ":" + sString);
}
