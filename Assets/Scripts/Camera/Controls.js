
import ApplicationState;


function Update () {
	
	if ( Input.GetButtonDown("Quit")  ) {
		 
		var isWebPlayer : boolean = Application.platform == RuntimePlatform.OSXWebPlayer || 
									Application.platform == RuntimePlatform.WindowsWebPlayer;
		
		//ApplicationState.instance.savePlayFile("savedPlay.xml");

									
		if (!isWebPlayer) {
			Application.Quit();	
			
		}
	}
	
	
	
}