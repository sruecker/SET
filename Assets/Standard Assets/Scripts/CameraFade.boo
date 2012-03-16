import UnityEngine

class CameraFade (MonoBehaviour): 
    
    # ---------------------------------------- #
    # PUBLIC FIELDS
    
    # Alpha start value
    public startAlpha as single = 1
    
    # Texture used for fading
    public fadeTexture as Texture2D
    
    # Default time a fade takes in seconds
    public fadeDuration as single = 2
    
    # Depth of the gui element
    public guiDepth as int = -1
    
    # Fade into scene at start
    public fadeIntoScene as bool = true
    
    # ---------------------------------------- #
    # PRIVATE FIELDS
    
    # Current alpha of the texture
    currentAlpha as single = 1
    
    # Current duration of the fade
    currentDuration as single
    
    # Direction of the fade
    fadeDirection as int = -1
    
    # Fade alpha to
    targetAlpha as single = 0
    
    # Alpha difference
    alphaDifference as single = 0
    
    # Style for background tiling
    private backgroundStyle as GUIStyle = GUIStyle()
    private dummyTex as Texture2D
    
    # ---------------------------------------- #
    # START FADE METHODS
    
    def FadeIn(duration as single, to as single):
        # Set fade duration
        currentDuration = duration
        # Set target alpha
        targetAlpha = to
        # Difference
        alphaDifference = Mathf.Clamp01(currentAlpha - targetAlpha)
        # Set direction to Fade in
        fadeDirection = -1
    
    def FadeIn():
        FadeIn(fadeDuration, 0)
    
    def FadeIn(duration as single):
        FadeIn(duration, 0)
    
    def FadeOut(duration as single, to as single):
        # Set fade duration
        currentDuration = duration
        # Set target alpha
        targetAlpha = to
        # Difference
        alphaDifference = Mathf.Clamp01(targetAlpha - currentAlpha)
        # Set direction to fade out
        fadeDirection = 1
    
    def FadeOut():
        FadeOut(fadeDuration, 1)
    
    def FadeOut(duration as single):
        FadeOut(duration, 1)
    
    # ---------------------------------------- #
    # STATIC FADING FOR MAIN CAMERA
    
    static def FadeInMain(duration as single, to as single):
        GetInstance().FadeIn(duration, to)
    
    static def FadeInMain():
        GetInstance().FadeIn()
    
    static def FadeInMain(duration as single):
        GetInstance().FadeIn(duration)
    
    static def FadeOutMain(duration as single, to as single):
        GetInstance().FadeOut(duration, to)
    
    static def FadeOutMain():
        GetInstance().FadeOut()
    
    static def FadeOutMain(duration as single):
        GetInstance().FadeOut(duration)
    
    # Get script fom Camera
    static def GetInstance() as CameraFade:
        # Get Script
        fader as CameraFade = Camera.main.GetComponent(CameraFade)
        # Check if script exists
        if (fader == null):
            raise System.Exception("No CameraFade attached to the main camera.")
        return fader
    
    # ---------------------------------------- #
    # SCENE FADEIN
    
    def Start():
        dummyTex = Texture2D(1,1)
        dummyTex.SetPixel(0,0,Color.clear)
        backgroundStyle.normal.background = fadeTexture
        currentAlpha = startAlpha
        if fadeIntoScene:
            FadeIn()
    
    # ---------------------------------------- #
    # FADING METHOD
    
    def OnGUI():
        
        # Fade alpha if active
        if ((fadeDirection == -1 and currentAlpha > targetAlpha)
                or
            (fadeDirection == 1 and currentAlpha < targetAlpha)):
            # Advance fade by fraction of full fade time
            currentAlpha += (fadeDirection * alphaDifference) * (Time.deltaTime / currentDuration)
            # Clamp to 0-1
            currentAlpha = Mathf.Clamp01(currentAlpha)
        
        # Draw only if not transculent
        if (currentAlpha > 0):
            # Draw texture at depth
            GUI.color.a = currentAlpha;
            GUI.depth = guiDepth;
            GUI.Label(Rect(-10, -10, Screen.width + 10, Screen.height + 10), dummyTex, backgroundStyle)