
function setX( x_ : int)
{
	gameObject.guiText.pixelOffset.x = x_;
}

function setY( y_ : int)
{
	gameObject.guiText.pixelOffset.y = Screen.height - y_;
}

function setColor( color_ : Color )
{
	gameObject.guiText.material.color = color_;	
}

function setText( text_ : String )
{
	gameObject.guiText.text = text_;
}

function setAlignment(alignment_ : TextAlignment)
{
	gameObject.guiText.alignment = alignment_;	
}