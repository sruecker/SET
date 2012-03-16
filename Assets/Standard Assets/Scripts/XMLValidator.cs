

using UnityEngine;
using System.Collections;
using System.Text;
using System.Xml;
using System.IO;
using System.Xml.Schema;

// adapated from http://jerrytech.blogspot.com/2008/12/validate-xmlxsd-using-xmlreadersettings.html

public class XMLValidator : MonoBehaviour {
	
	private bool isValid;
	
	private string xsdString = ""+
"<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"+
"<xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">"+
"  "+
"  <xs:element name=\"act\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"name\" />"+
"        <xs:element ref=\"scenes\" />"+
"      </xs:sequence>"+
"      <xs:attribute name=\"id\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"acts\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"act\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"annotation\">"+
"    <xs:complexType mixed=\"true\">"+
"      <xs:attribute name=\"startTime\" type=\"xs:decimal\" use=\"required\" />"+
"      <xs:attribute name=\"endTime\" type=\"xs:decimal\" />"+
"      <xs:attribute name=\"character\" type=\"xs:NMTOKEN\" />"+
"      <xs:attribute name=\"image\" type=\"xs:string\" />"+
"      <xs:attribute name=\"header\" type=\"xs:NMTOKEN\" />"+
"      <xs:attribute name=\"sd\" type=\"xs:boolean\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"annotations\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"annotation\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
//"  <xs:element name=\"directions\">"+
//"    <xs:complexType>"+
//"      <xs:sequence>"+
//"        <xs:element ref=\"direction\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
//"      </xs:sequence>"+
//"    </xs:complexType>"+
//"  </xs:element>"+
""+
"  <xs:element name=\"view\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"location\" />"+
"        <xs:element ref=\"lookAt\" />"+
"        <xs:element ref=\"name\" minOccurs=\"0\"/>"+
"      </xs:sequence>"+
"      <xs:attribute name=\"id\" type=\"xs:string\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"location\" type=\"xs:string\" />"+
"  <xs:element name=\"lookAt\" type=\"xs:string\" />"+
""+
"  <xs:element name=\"views\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"view\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"beats\">"+
"    <xs:complexType mixed=\"true\" />"+
"  </xs:element>"+
""+
"  <xs:element name=\"cast\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"character\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"character\">"+
"    <xs:complexType>"+
"      <xs:all>"+
"        <xs:element ref=\"name\" />"+
"        <xs:element ref=\"color\" />"+
"        <xs:element ref=\"model\" />"+
"      </xs:all>"+
"      <xs:attribute name=\"id\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"name\" type=\"xs:string\" />"+
""+
"  <xs:element name=\"color\" type=\"xs:string\" />"+
"  "+
"  <xs:element name=\"model\" type=\"xs:string\" />"+
""+
"  <xs:element name=\"destination\">"+
"    <xs:complexType mixed=\"true\">"+
"      <xs:attribute name=\"endTime\" type=\"xs:decimal\" use=\"required\" />"+
"      <xs:attribute name=\"character\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
//"  <xs:element name=\"direction\">"+
//"    <xs:complexType mixed=\"true\">"+
//"      <xs:attribute name=\"startTime\" type=\"xs:decimal\" use=\"required\" />"+
//"      <xs:attribute name=\"endTime\" type=\"xs:decimal\" use=\"required\" />"+
//"      <xs:attribute name=\"object\" type=\"xs:NMTOKEN\" />"+
//"    </xs:complexType>"+
//"  </xs:element>"+
""+
"  <xs:element name=\"action\">"+
"    <xs:complexType mixed=\"true\">"+
"      <xs:attribute name=\"endTime\" type=\"xs:decimal\" use=\"required\" />"+
"      <xs:attribute name=\"character\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"      <xs:attribute name=\"type\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"destinations\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"destination\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"actions\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"action\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"line\">"+
"    <xs:complexType mixed=\"true\">"+
"      <xs:attribute name=\"startTime\" type=\"xs:decimal\" use=\"required\" />"+
"      <xs:attribute name=\"character\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"      <xs:attribute name=\"pace\" type=\"xs:decimal\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"lines\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"line\" minOccurs=\"0\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"play\">"+
"    <xs:complexType>"+
"      <xs:all>"+
"        <xs:element ref=\"stage\" />"+
"        <xs:element ref=\"cast\" />"+
"        <xs:element ref=\"acts\" />"+
"        <xs:element ref=\"annotations\" />"+
//"        <xs:element ref=\"directions\" />"+
"        <xs:element ref=\"views\" />"+
"      </xs:all>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"scene\">"+
"    <xs:complexType>"+
"      <xs:all>"+
"        <xs:element ref=\"name\" />"+
"        <xs:element ref=\"destinations\" minOccurs=\"0\" />"+
"        <xs:element ref=\"actions\" minOccurs=\"0\" />"+
"        <xs:element ref=\"lines\" minOccurs=\"0\" />"+
"        <xs:element ref=\"beats\" minOccurs=\"0\" />"+
"      </xs:all>"+
"      <xs:attribute name=\"id\" type=\"xs:NMTOKEN\" use=\"required\" />"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"scenes\">"+
"    <xs:complexType>"+
"      <xs:sequence>"+
"        <xs:element ref=\"scene\" maxOccurs=\"unbounded\" />"+
"      </xs:sequence>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"stage\">"+
"    <xs:complexType>"+
"      <xs:all>"+
"        <xs:element ref=\"model\" />"+
"        <xs:element ref=\"set\" minOccurs=\"0\" maxOccurs=\"1\"  />"+
"      </xs:all>"+
"    </xs:complexType>"+
"  </xs:element>"+
""+
"  <xs:element name=\"set\" type=\"xs:string\" />"+
""+
"</xs:schema>";
	
	public bool ValidateXml(string xmlFileLocation) {
		isValid = true;
		try {
			string xml = "";
			using(StreamReader rdr = File.OpenText(xmlFileLocation)) {
				xml = rdr.ReadToEnd();
			}
			
			// build XSD schema
			StringReader _XsdStream = new StringReader(xsdString);

			XmlSchema _XmlSchema = XmlSchema.Read(_XsdStream, null);

			// build settings (this replaces XmlValidatingReader)
			XmlReaderSettings settings = new XmlReaderSettings();
			settings.ValidationType = ValidationType.Schema;
			settings.Schemas.Add(_XmlSchema);
			settings.IgnoreComments = true;
			settings.IgnoreProcessingInstructions = true;
			settings.IgnoreWhitespace = true;
			settings.ValidationEventHandler += new ValidationEventHandler(ValidationCallBack);

			// build XML reader
			StringReader _XmlStream = new StringReader(xml);

			XmlReader _XmlReader = XmlReader.Create(_XmlStream, settings);

			// validate
			using (_XmlReader) {
				while (_XmlReader.Read());
			}
		} catch {
			isValid = false;
		}
		return isValid;
	}
	
	private void ValidationCallBack (object sender, ValidationEventArgs args) {
		if (args.Severity == XmlSeverityType.Warning) {
			Debug.Log("Warning: " + args.Message);
		} else {
			if (args.Message.IndexOf("Character content not allowed") == -1) { // ignore this error which gets thrown all the time for no reason
				isValid = false;
				Debug.Log("Error: " + args.Message);
			}
		}
	} 
}

