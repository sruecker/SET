#pragma strict
#pragma implicit
#pragma downcast

class ToolTipSender extends MonoBehaviour {

	private var __lastTooltip;

	function Awake() {
		__lastTooltip = "";
		ApplicationState.instance.currentToolTip = "";
	}

	function UpdateToolTip () {
		if (Event.current.type == EventType.repaint) {
			if (GUI.tooltip != "") { // mouseIn
				ApplicationState.instance.currentToolTip = GUI.tooltip;
				__lastToolTip = GUI.tooltip;
			}

			if ( __lastToolTip != GUI.tooltip) { // mouseOut
			 	__lastToolTip = GUI.tooltip;
				ApplicationState.instance.currentToolTip = "";
			}
		}
	}

}