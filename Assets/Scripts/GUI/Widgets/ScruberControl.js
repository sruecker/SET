
private var __scruberObject : Transform;
private var __scruberComponent : ScruberOld;

// copied from TimeLineView, this should be placed on the application state 
private var startTimeLineAtX : int = 50;


function Awake()
{
	__scruberObject = transform.Find("Scruber");

}

/*
 * check why you still have to remove half the size of the pointer
 */


function Start()
{
	__scruberComponent = __scruberObject.GetComponent(ScruberOld);
	__scruberComponent.setSliderMaxMin(Screen.width, startTimeLineAtX);
	__scruberComponent.setArea(Rect (0, Screen.height - 95, 100, 38));
	var workingArea : int = Screen.width - startTimeLineAtX;
	var currentPosition : float = (ApplicationState.instance.playTime * workingArea / ApplicationState.instance.playTimeLength) + startTimeLineAtX - __scruberComponent.getPointerXPos() -7;
	__scruberComponent.setX( Mathf.Floor( currentPosition ) );
}


function Update () {
	
	if (ApplicationState.instance.animate) {
		
		// calculate new position		
		var workingArea : int = Screen.width - startTimeLineAtX;
		
		var currentPosition : float = (ApplicationState.instance.playTime * workingArea / ApplicationState.instance.playTimeLength) + startTimeLineAtX - __scruberComponent.getPointerXPos() -7;
		
		__scruberComponent.setX( Mathf.Floor( currentPosition ) );

	}
	
}