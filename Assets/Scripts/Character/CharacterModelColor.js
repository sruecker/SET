
private var __characterBodyMaterial : Material;
private var __characterObject : GameObject;
// XXX Fix for sound emitters
function Awake()
{
	__characterBodyMaterial = Instantiate(Resources.Load( "Prefabs/charactermodel-charactermaterial" )) as Material;
	// Debug.Log(name);
	// Debug.Log(transform.Find("CharacterModel"));
	// __characterObject = transform.Find("CharacterModel").gameObject;
}


function setShader (newShader : Shader) {
	__characterBodyMaterial.CopyPropertiesFromMaterial(gameObject.GetComponentInChildren(MeshRenderer).material);
	__characterBodyMaterial.shader = newShader;
	applyMaterial();
}

function setBodyColor( newColor : Color ) 
{
	
	// This should change from model to model
	__characterBodyMaterial.shader = gameObject.GetComponentInChildren(MeshRenderer).material.shader;
	__characterBodyMaterial.CopyPropertiesFromMaterial(gameObject.GetComponentInChildren(MeshRenderer).material);

	__characterBodyMaterial.color = newColor;
	//gameObject.GetComponentInChildren(MeshRenderer).material = __characterBodyMaterial;
	
	applyMaterial();
		
}

private function applyMaterial() {
	var currentMeshRenderer : MeshRenderer;
	// var meshRenderers : Array = __characterObject.GetComponentsInChildren(MeshRenderer);
	var meshRenderers : Array = gameObject.GetComponentsInChildren(MeshRenderer);
	
	for (currentMeshRenderer in meshRenderers) {
		currentMeshRenderer.material = __characterBodyMaterial;
	}

	meshRenderers = gameObject.GetComponents(MeshRenderer);
	
	for (currentMeshRenderer in meshRenderers) {
		currentMeshRenderer.material = __characterBodyMaterial;
	}
}
