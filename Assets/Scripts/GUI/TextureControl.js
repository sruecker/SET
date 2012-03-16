

function setArea( area_ : Rect )
{
	var timeLineRect : Rect = area_;
	
	timeLineRect.x = area_.x;
	timeLineRect.y = Screen.height - area_.height - area_.y;
	
	gameObject.guiTexture.pixelInset = timeLineRect;
	
}

function setX( x_ : int)
{
	gameObject.guiTexture.pixelInset.x = x_;
	
}

function setY( y_ : int)
{
	gameObject.guiTexture.pixelInset.y = Screen.height - gameObject.guiTexture.pixelInset.height - y_;
	
}

function setColor( color_ : Color)
{
	gameObject.guiTexture.color = color_;
	
}

function setAlpha( a_ : float)
{
	gameObject.guiTexture.color.a = a_;
	
}

function setWidth( width_ : int)
{
	gameObject.guiTexture.pixelInset.width = width_;	
	
}

function getWidth() : int
{
	return gameObject.guiTexture.pixelInset.width;	
	
}

function setHeight( height_ : int)
{
	gameObject.guiTexture.pixelInset.height = height_;	
	
}