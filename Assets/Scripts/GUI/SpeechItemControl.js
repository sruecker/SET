
public var headerImage : Texture2D;
public var headerFont : Font;
public var lineFont : Font;
public var area : Rect = Rect(0, 0, 100, 100);
public var headerHehight : int = 30;
public var show : boolean = true;

public var character : String = "Character";
public var starTime : float = 0;
public var endTime : float = 1;
public var line : String = "Eloquent Character line";



public function colorHeader(color : Color)
{
	
	Debug.Log("Set header color");	
	
}


function OnGUI()
{
	if (show) {
		GUI.Label (Rect(area.x, area.y, area.width, headerHehight), headerImage);
		GUI.Label (Rect(area.x, area.y, area.width, headerHehight), character);
		textAreaString = GUI.TextArea (Rect(area.x, area.y + headerHehight, area.width, area.height - headerHehight), line);	
	}
	
}