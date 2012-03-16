// Put "import Mathfx;" at the top of the javascript you wish you use this code in
#pragma strict
#pragma implicit
#pragma downcast
import UnityEngine.Mathf;

static function Hermite(start : float, end : float, value : float) : float
{
    return Mathf.Lerp(start, end, value * value * (3.0 - 2.0 * value));
}
    
static function Sinerp(start : float, end : float, value : float) : float
{
    return Mathf.Lerp(start, end, Mathf.Sin(value * Mathf.PI * 0.5));
}

static function Coserp(start : float, end : float, value : float) : float
{
    return Mathf.Lerp(start, end, 1.0 - Mathf.Cos(value * Mathf.PI * 0.5));
}
 
static function Berp(start : float, end : float, value : float) : float
{
    value = Mathf.Clamp01(value);
    value = (Mathf.Sin(value * Mathf.PI * (0.2 + 2.5 * value * value * value)) * Mathf.Pow(1 - value, 2.2) + value) * (1 + (1.2 * (1 - value)));
    return start + (end - start) * value;
}
    
static function SmoothStep (x : float, min : float, max : float) : float
{
    x = Mathf.Clamp (x, min, max);
    var v1 = (x-min)/(max-min);
    var v2 = (x-min)/(max-min);
    return -2*v1 * v1 *v1 + 3*v2 * v2;
}
 
static function Lerp(start : float, end : float, value : float) : float
{
    return ((1.0 - value) * start) + (value * end);
}
 
static function NearestPoint(lineStart : Vector3, lineEnd : Vector3, point : Vector3) : Vector3
{
    var lineDirection = Vector3.Normalize(lineEnd-lineStart);
    var closestPoint = Vector3.Dot((point-lineStart),lineDirection)/Vector3.Dot(lineDirection,lineDirection);
    return lineStart+(closestPoint*lineDirection);
}
 
static function NearestPointStrict(lineStart : Vector3, lineEnd : Vector3, point : Vector3) : Vector3
{
    var fullDirection = lineEnd-lineStart;
    var lineDirection = Vector3.Normalize(fullDirection);
    var closestPoint = Vector3.Dot((point-lineStart),lineDirection)/Vector3.Dot(lineDirection,lineDirection);
    return lineStart+(Mathf.Clamp(closestPoint,0.0,Vector3.Magnitude(fullDirection))*lineDirection);
}

static function NearestPointStrict(lineStart : Vector2, lineEnd : Vector2, point : Vector2) : Vector2
{
    var fullDirection = lineEnd-lineStart;
    var lineDirection = Normalize(fullDirection);
    var closestPoint = Vector2.Dot((point-lineStart),lineDirection)/Vector2.Dot(lineDirection,lineDirection);
    return lineStart+(Mathf.Clamp(closestPoint,0.0,fullDirection.magnitude)*lineDirection);
}



static function Bounce(x : float) : float {
    return Mathf.Abs(Mathf.Sin(6.28*(x+1)*(x+1)) * (1-x));
}
    
// test for value that is near specified float (due to floating point inprecision)
// all thanks to Opless for this!
static function Approx(val : float, about : float, range : float) : boolean {
    return ( ( Mathf.Abs(val - about) < range) );
}
 
// test if a Vector3 is close to another Vector3 (due to floating point inprecision)
// compares the square of the distance to the square of the range as this 
// avoids calculating a square root which is much slower than squaring the range
static function Approx(val : Vector3, about : Vector3, range : float) : boolean {
   return ( (val - about).sqrMagnitude < range*range);
}
static function GaussFalloff (distance : float , inRadius : float) {
	return Mathf.Clamp01 (Mathf.Pow (360.0, -Mathf.Pow (distance / inRadius, 2.5) - 0.01));
}
// CLerp - Circular Lerp - is like lerp but handles the wraparound from 0 to 360.
// This is useful when interpolating eulerAngles and the object
// crosses the 0/360 boundary.  The standard Lerp function causes the object
// to rotate in the wrong direction and looks stupid. Clerp fixes that.
static function Clerp(start : float, end : float, value : float) : float {
   var min = 0.0;
   var max = 360.0;
   var half = Mathf.Abs((max - min)/2.0);//half the distance between min and max
   var retval = 0.0;
   var diff = 0.0;
    
   if((end - start) < -half){
       diff = ((max - start)+end)*value;
       retval =  start+diff;
   }
   else if((end - start) > half){
       diff = -((max - end)+start)*value;
       retval =  start+diff;
   }
   else retval =  start+(end-start)*value;
    
   return retval;
}


//======= NEW =========//


static function RotateVector (vector : Vector2,rad : float) {
	rad *= Mathf.Deg2Rad;
	return Vector2 ((vector.x * Mathf.Cos(rad)) - (vector.y * Mathf.Sin(rad)),(vector.x * Mathf.Sin(rad)) + (vector.y * Mathf.Cos(rad)));
}

static function IntersectPoint (start1 : Vector2,start2 : Vector2,dir1 : Vector2,dir2 : Vector2) {
	if (dir1.x==dir2.x) {
		return Vector2.zero;
	}
	
	h1 = dir1.y/dir1.x;
	h2 = dir2.y/dir2.x;
	
	if (h1==h2) {
		return Vector2.zero;
	}
	
	line1 = Vector2 (h1,start1.y-start1.x*h1);
	line2 = Vector2 (h2,start2.y-start2.x*h2);
	
	y1 = line2.y-line1.y;
	x1 = line1.x-line2.x;
	
	x2 = y1 / x1;
	
	y2 = line1.x*x2 + line1.y;
	return Vector2(x2,y2);
}

static function ThreePointCircle (a1 : Vector2,a2 : Vector2,a3 : Vector2) {
	dir = a2-a1;
	dir /= 2;
	b1 = a1+dir;
	dir = RotateVector (dir,90);
	l1 = dir;
	
	dir = a3-a2;
	dir /= 2;
	b2 = a2+dir;
	dir = RotateVector (dir,90);
	l2 = dir;
	p = IntersectPoint (b1,b2,l1,l2);
	return p;
}

//===== Bezier ====== //

static function CubicBezier (t : float,p0 : Vector2,p1 : Vector2,p2 : Vector2,p3 : Vector2) {
	t = Clamp01 (t);
	t2 = 1-t;
	return Pow(t2,3) * p0 + 3 * Pow(t2,2) * t * p1 + 3 * t2 * Pow(t,2) * p2 + Pow(t,3) * p3;
}

static function NearestPointOnBezier (p : Vector2,c : BezierCurve,accuracy : float,doubleAc : boolean) {
	var minDist : float = Mathf.Infinity;
	var minT : float = 0;
	var minP : Vector2;
	for (var i : float = 0 ;i<1;i+=accuracy) {
		point  = c.Get (i);
		var d : float = (p - point).sqrMagnitude;
		if (d<minDist) {
			minDist=d;
			minT = i;
			minP = point;
		}
	}
	
	if (!doubleAc) {
		return minP;
	}
	
	var st : float = Clamp01 (minT-accuracy);
	var en : float = Clamp01 (minT+accuracy);
	
	
	for (i=st;i<en;i+=accuracy/10) {
		point  = c.Get (i);
		d= (p - point).sqrMagnitude;
		if (d<minDist) {
			minDist=d;
			minT = i;
			minP = point;
		}
	}
	
	
	return minP;
}

static function IsNearBezierTest (p : Vector2,c : BezierCurve,accuracy : float,maxDist : float) {
	var prepoint : Vector2 = c.Get (0);
	for (var i : float = accuracy;i<1;i+=accuracy) {
		point  = c.Get (i);
		var d : float = (p - point).sqrMagnitude;
		var d2 : float = (prepoint - point + Vector2(maxDist,maxDist)).sqrMagnitude;
		if (d<=d2*2) {
			return true;
		}
	}
	
	return false;
}

static function NearestPointOnBezier (p : Vector2,p0 : Vector2,p1 : Vector2,p2 : Vector2,p3 : Vector2) {
	
	
	var minDist : float = Mathf.Infinity;
	var minT : float = 0;
	var minP : Vector2;
	for (var i : float = 0 ;i<1;i+=0.01) {
		point  = CubicBezier (i,p0,p1,p2,p3);
		var d : float = (p - point).sqrMagnitude;
		if (d<minDist) {
			minDist=d;
			minT = i;
			minP = point;
		}
	}
	
	var st : float = Clamp01 (minT-0.01);
	var en : float = Clamp01 (minT+0.01);
	
	for (i=st;i<en;i+=0.001) {
		point  = CubicBezier (i,p0,p1,p2,p3);
		d= (p - point).sqrMagnitude;
		if (d<minDist) {
			minDist=d;
			minT = i;
			minP = point;
		}
	}
	
	return minP;
	
}

static function IsNearBezier (p : Vector2,point1 : BezierPoint,point2 : BezierPoint,rad : float) {
	if (point1.curve2 != point2.curve1) {
		Debug.LogError ("Curves Not The Same");
		return false;
	}
	
	var curve : BezierCurve = point1.curve2;
	
	r = curve.rect;
	r.x-=rad;
	r.y-=rad;
	r.width+=rad*2;
	r.height+=rad*2;
	
	if (!r.Contains (p)) {
		return false;
	}
	
	nearest = NearestPointOnBezier (p,curve,0.1,false);
	
	sec = point1.curve2.aproxLength/10;
	
	if ((nearest-p).sqrMagnitude>=(sec*3)*(sec*3)) {
		return false;
	}
	
	nearest = NearestPointOnBezier (p,curve,0.01,true);
	
	if ((nearest-p).sqrMagnitude<=rad*rad) {
		return true;
	}
	
	return false;
}

static function IsNearBeziers (p : Vector2,points : BezierPoint[],rad : float) {
	for (i=0;i<points.length-1;i++) {
		if (IsNearBezier (p,points[i],points[i+1],rad)) {
			return true;
		}
	}
	return false;
}

//====== End Bezier ========//

static function NearestPointOnCircle (p : Vector2,center : Vector2,w : float) {
	dir = p-center;
	dir = Normalize (dir);
	dir *= w;
	return center+dir;
}
static function Normalize (p : Vector2) {
	var mag : float = p.magnitude;
	return p/mag;
}