// adapted from: http://forum.unity3d.com/viewtopic.php?t=15143

using UnityEngine;
using System.IO;
using System.Collections;
using System.Text.RegularExpressions;

public class CTreeView : MonoBehaviour {
   
   public Rect winRect = new Rect(35,35,120,50);   //windows basic rect
	public int winId;
   public string location;
   private Vector2 scrollPosition;
   
   private string[] strs;   //record the special level's selection
	private int dirIndex; // what level in the dirs are we?
   public string path;   //this is the selected file's full name
	private FileInfo selectedFile;
   
	public GUISkin gSkin;
	
   public GUIStyle fileStyle;                  //if the item is a file use this style
   public GUIStyle dirStyle;                  //if the item is a directory use this style
	public GUIStyle driveStyle;                  //if the item is a drive use this style
   
   public string filterRegexString;                     //filter of file select
	private Regex filterRegex;
   
	public Texture2D parentTexture;	// the parent texture
	public Texture2D driveTexture;               //the drive texture
	public Texture2D dirTexture;               //the directory texture
   public Texture2D fileTexture;               //the file texture
	
   public bool visible;
   
   private int fileMode;
   // posible modes
   public const int OPEN = 0;
   public const int SAVE = 1;
   
   private int intClickCount;
   
   private string errorMsg;
   
   public void setFileMode(int _fileMode) {
	   // don't change mode while window is visible
	   if (!visible && (_fileMode == OPEN || _fileMode == SAVE)) {
		   fileMode = _fileMode;
	   }
   }
   
   void Awake()
   {
      location = new DirectoryInfo(Application.dataPath).Root.ToString();
      strs = new string[20];
      path = "";
	   errorMsg = "";
	   selectedFile = null;
	   if( filterRegexString=="") filterRegexString = "*";
	   filterRegex = new Regex(filterRegexString);
	  visible = false;
	   fileMode = OPEN;
	   intClickCount = 0;
	   winId = 1;
   }
   
   void OnGUI()
   {
	   if (visible) {
		   GUI.skin = gSkin;
		   winRect = GUILayout.Window(winId, winRect, DoMyWindow, "File Browser");
		   GUI.BringWindowToFront(winId);
	   }
   }
   
   void DoMyWindow(int windowID)
   {
      OpenFileWindow(location);
      GUI.DragWindow();
   }
   
   void OpenFileWindow( string location )
   {
	   GUILayout.Label("Location: " + location);
	   GUILayout.BeginHorizontal();
	   
	   // list available drives
	   GUILayout.BeginVertical(GUILayout.Height(200));
	   foreach (string drive in Directory.GetLogicalDrives()) {
		   if (GUILayout.Button(new GUIContent(" "+drive, driveTexture), driveStyle)) {
			   this.location = drive;
		   }
	   }
	   GUILayout.EndVertical();
	   
	   // file browser
      scrollPosition = GUILayout.BeginScrollView (scrollPosition,GUILayout.Width(315),GUILayout.Height(400));
      GUILayout.BeginVertical();
	  FileBrowser( location, 0, 0);
      GUILayout.EndVertical();
      GUILayout.EndScrollView ();
	   
	   GUILayout.EndHorizontal();
	   
	   switch (fileMode) {
		   case OPEN:
			   if (path != "") GUILayout.Label("Selected: " + path);
			   else GUILayout.Label("No file selected.");
			   break;
		   case SAVE:
			   GUILayout.BeginHorizontal();
			   GUILayout.Label("File name: ");
			   path = GUILayout.TextField(path, 50, GUILayout.Width(200));
			   GUILayout.FlexibleSpace();
			   GUILayout.EndHorizontal();
			   break;
	   }
	   
	   if (errorMsg != "") GUILayout.Label(errorMsg);
	   GUILayout.BeginHorizontal();
	   GUILayout.FlexibleSpace();
	   
	   switch (fileMode) {
		   case OPEN:
			   if (GUILayout.Button("Open File")) {
				   if (selectedFile != null) {
					   DoOpen();
				   } else {
					   errorMsg = "Select a file to open.";
				   }
					path = "";
			   }
			   break;
		   case SAVE:
			   if (GUILayout.Button("Save File")) {
				   if (path != "") {
				DoSave();
					 //  if (path.IndexOfAny(Path.GetInvalidFileNameChars()) == -1) {
					//	   DoSave();
					 //  } else {
					//	   errorMsg = "The file name is invalid.";
					   //}
				   } else {
					   errorMsg = "Enter a file name to save.";
				   }
			   }
			   break;
	   }
	   
	   if (GUILayout.Button("Close")) {
		   visible = false;
	   }
	   GUILayout.FlexibleSpace();
	   GUILayout.EndHorizontal();
   }
   
   void FileBrowser( string location, int spaceNum, int index)
   {
      FileInfo fileSelection;
      DirectoryInfo directoryInfo;
      
	   dirIndex = index;
      fileSelection = new FileInfo( location );
      if((fileSelection.Attributes & FileAttributes.Directory) == FileAttributes.Directory) {
         directoryInfo = new DirectoryInfo( location );
         
		  GUILayout.BeginVertical();
			if (spaceNum == 0) {
				GUILayout.BeginHorizontal();
				 if (GUILayout.Button(new GUIContent(" ..", parentTexture), dirStyle)) {
					 if (directoryInfo.FullName != directoryInfo.Root.ToString()) {
						this.location = directoryInfo.Parent.ToString();
					 }
				 }
				 GUILayout.EndHorizontal();
			 }
			 foreach( DirectoryInfo dirInfo in directoryInfo.GetDirectories())
			 {
				GUILayout.BeginHorizontal();
				GUILayout.Space(spaceNum);
				if(GUILayout.Button(new GUIContent(" "+dirInfo.Name, dirTexture), dirStyle)) {
					if (fileMode == OPEN) path = "";
					selectedFile = null;
					if (intClickCount == 0) {
						intClickCount++;
						StartCoroutine("CheckMouseClick");
					} else {
						intClickCount++;
					}
					
				   if (dirInfo.FullName == strs[index]) {
					   //~ strs[index] = null; // collapse directory
				   } else {
					   strs[index] = dirInfo.FullName; // expand directory
					   //~ this.location = dirInfo.FullName;
				   }
				}
				GUILayout.EndHorizontal();
				if(dirInfo.FullName == strs[index] && strs[index] != location) FileBrowser(strs[index], spaceNum + 20, index+1);            
			 }
			 
			 fileSelection = SelectList(directoryInfo.GetFiles(), null, fileStyle, fileTexture, spaceNum) as FileInfo;
			 if( fileSelection != null ) {
				if (fileMode == SAVE) path = fileSelection.Name;
				else path = fileSelection.FullName;
				 selectedFile = fileSelection;
			 }
				
		  GUILayout.EndVertical();
	  } else {
		  // not a valid directory
		  GUILayout.Label("Not a valid directory.");
	  }
   }
   
   private IEnumerator CheckMouseClick() {
	   if (intClickCount == 1) {
		   yield return new WaitForSeconds(0.3f); // double click delay validation
		   if (intClickCount > 1) {
			   //~ Debug.Log("double click");
			   if (this.selectedFile != null) {
				   switch (this.fileMode) {
					   case OPEN:
						   DoOpen();
					       break;
					   case SAVE:
						   DoSave();
					       break;
				   }
			   } else if (this.selectedFile == null) {
				   this.location = strs[dirIndex-1];
			   }
			   intClickCount = 0;
		   } else {
			   intClickCount = 0;
		   }
	   }
   }
   
   private object SelectList( ICollection list, object selected, GUIStyle style, Texture image, int spaceNum)
   {
	  string fileName;
	
      foreach( object item in list )
      {
         //just show the name of directory and file
         FileSystemInfo info = item as FileSystemInfo;
		  fileName = info.Name.ToLower();
		  if (this.filterRegex.IsMatch(fileName)) {
			 GUILayout.BeginHorizontal();
			 GUILayout.Space(spaceNum);
			 if( GUILayout.Button(new GUIContent(info.Name, image), style) ) {
				if (intClickCount == 0) {
					intClickCount++;
					StartCoroutine("CheckMouseClick");
				} else {
					intClickCount++;
				}
				selected = item;
			 }
			 GUILayout.EndHorizontal();
		 }
      }
      return selected;
   }
   
   private void DoOpen() {
	   visible = false;
	   SendMessageUpwards("OpenFile", selectedFile.FullName);
	   errorMsg = "";
   }
   
   private void DoSave() {
	   string filename = "";
	   visible = false;
	   if ((selectedFile != null && selectedFile.Name != path) || selectedFile == null) {
		   string basePath = dirIndex > 0 ? strs[dirIndex-1] : this.location;
		   filename = Path.Combine(basePath, path);
	   } else filename = selectedFile.FullName;
	   SendMessageUpwards("SaveFile", filename);
	   path = "";
	   errorMsg = "";
   }
} 
