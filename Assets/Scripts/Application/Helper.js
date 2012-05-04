#pragma strict

static var instance : Helper;


instance = FindObjectOfType(Helper);

if (instance == null) {
    Debug.Log ("Could not locate an Helper object. You have to have exactly one Helper in the play.");
}


static function FloatToTime(currentTime: float)
{
	var hours : int = currentTime / 3600;
	currentTime -= hours * 3600;
	var minutes : int = currentTime / 60;
	currentTime -= minutes * 60;
	var seconds : int = currentTime;
	
	var hString : String = hours < 10 ? "0" + hours.ToString() : hours.ToString();
	var mString : String = minutes < 10 ? "0" + minutes.ToString() : minutes.ToString();
	var sString : String = seconds < 10 ? "0" + seconds.ToString() : seconds.ToString();
	
	
	return hString + ":" + mString + ":" + sString;
}