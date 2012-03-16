

private var __showGUI : boolean = true;

private var __mouseTarget : GameObject;
private var __stageColliders : Array;

private var __ray : Ray;
private var __hit : RaycastHit;
private var DISAPPEAR_POS : Vector3 = Vector3(-1000000, -1000000, -1000000);

function Awake() 
{
	__mouseTarget = Instantiate(Resources.Load( "Prefabs/MouseTargetProjector" )) as GameObject;
	
}

function Start()
{
	var stages = GameObject.FindGameObjectsWithTag("Stage");
	for (objectAsStage in stages) {	
		__stageColliders.Push(objectAsStage.FindObjectsOfType(Collider));	
	}
}

function Update () 
{
	
	// if (Input.GetButtonDown("GUI Toggle") ) {
	// 		__showGUI = ! __showGUI;
	// 	}
	
	
	if (__showGUI) {
		
		__ray = Camera.main.ScreenPointToRay (Input.mousePosition);
		var gotNearest : boolean = false;
		var shortestDistance : float = 	100000000;
		var currentDistance : float;

		var floorCollider : Collider;
			
		for (var stageCollider : Collider in __stageColliders) {
				
				if (stageCollider.Raycast(__ray, __hit, 100000000)) {
					// XXX check for a single entry
				
					if (stageCollider.name != "CharacterController") {
						// ugly code, should get something more elegant for testing
						// character collisions
					
						gotNearest = true;
						currentDistance = Vector3.Distance (__hit.point , transform.position);
						if ( currentDistance < shortestDistance ) {
							shortestDistance = currentDistance;
							currentPoint = __hit.point;
							floorCollider = stageCollider;
						}
					
					}		    		
		    		
				}			
		}
		
		Debug.DrawLine (__ray.origin, currentPoint);
		
		if (gotNearest) {
		
			// shoot up to get a good height			
			
			shortestDistance = Mathf.Abs( this.transform.position.y - currentPoint.y ); // camera y - currentPoint y
			//Debug.Log(shortestDistance);
			
			//Debug.Log(this.transform.position);
			
			__ray = Ray( currentPoint, Vector3(0,1,0) );
			
			currentPoint.y = this.transform.position.y;

			
			for (var stageCollider : Collider in __stageColliders) {
				
				if (floorCollider != stageCollider) {
					if (stageCollider.Raycast(__ray, __hit, shortestDistance)) {
						currentDistance = Vector3.Distance(__hit.point , __ray.origin);
						
						
						if ( currentDistance < shortestDistance ) {
							currentPoint.y = __hit.point.y;	
						
						}
					}
				}
				
			}
			Debug.DrawLine (__ray.origin, currentPoint);
			
			__mouseTarget.transform.position = currentPoint;	
			
			__mouseTarget.GetComponent("Projector").farClipPlane = shortestDistance + 0.1;

		} else {
			__mouseTarget.transform.position = DISAPPEAR_POS;
		}

		
	} else {
		
		__mouseTarget.transform.position = DISAPPEAR_POS;
	}
	
}