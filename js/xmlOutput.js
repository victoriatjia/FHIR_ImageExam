var obsID = '';
var params = {};
var patientStudy_ID, ImagingStudy_ID;

function formInputsToXML(type, URL, uid, svgBase64, vw, vh, wc, ww, pixelData, dcmFile, annotationType) {
	var baseURL = "https://www.dicom.org.tw/";
	Observation.identifier[0].system = URL;
	Observation.identifier[0].value = uid;
	Observation.status = "final";
	Observation.code.coding[0].code = type;
	Observation.code.coding[0].system = "https://www.dicom.org.tw/";
	Observation.code.coding[0].Display = type;

	//Observation.subject.reference = "Patient/" + p[0];
	annotationObservation.basedOn[0].identifier.system = URL;
	annotationObservation.basedOn[0].identifier.value = uid;
	annotationObservation.category[0].coding[0].system = "http://hl7.org/fhir/observation-category";
	annotationObservation.category[0].coding[0].code = "imaging";
	annotationObservation.component[0].code.coding[0].system = baseURL + "SVG";
	annotationObservation.component[0].code.coding[0].code = "SVG.Annotation";
	annotationObservation.component[0].valueString = svgBase64;
	annotationObservation.component[1].code.coding[0].system = baseURL + "Columns";
	annotationObservation.component[1].code.coding[0].code = "Columns";
	annotationObservation.component[1].valueString = vw;
	annotationObservation.component[2].code.coding[0].system = baseURL + "Rows";
	annotationObservation.component[2].code.coding[0].code = "Rows";
	annotationObservation.component[2].valueString = vh;
	annotationObservation.component[3].code.coding[0].system = baseURL + "WindowLevel";
	annotationObservation.component[3].code.coding[0].code = "WindowCenter";
	annotationObservation.component[3].valueString = wc;
	annotationObservation.component[4].code.coding[0].system = baseURL + "WindowLevel";
	annotationObservation.component[4].code.coding[0].code = "WindowWidth";
	annotationObservation.component[4].valueString = ww;
	annotationObservation.component[5].code.coding[0].system = baseURL + "OffsetOfPixelData";
	annotationObservation.component[5].code.coding[0].code = "OffsetOfPixelData";
	annotationObservation.component[5].valueString = pixelData;
	annotationObservation.component[6].code.coding[0].system = baseURL + "DCM_File";
	annotationObservation.component[6].code.coding[0].code = "DCM File";
	annotationObservation.component[6].valueString = dcmFile;
	output = Object.assign(Observation, annotationObservation);
	//alert(output);
	postData(output, "Observation", annotationType);
}

function mammoXML(formID, formCode) {
	var thisform = document.getElementById(formID);
	var elements = thisform.elements;
	var p = new Array(15), count = 1;
	p[0] = patientStudy_ID;
	if (formID == 'QuestionCheck') {
		var que = ["RetractionSkin_", "ThickeningSkin_", "DilatedLactiferous_", "EnlargedAxillary_"];
		for (i = 0; i < que.length; i++) {
			for (j = 0; j < 2; j++) {
				p[count] = que[i] + j;
				count++;
				var a = document.getElementById(p[count - 1]);
				if (a.checked == true) {

					p[count] = "Exist";
					p[count - 1] += p[count];
				}
				else {
					p[count] = "None";
					p[count - 1] += p[count];
				}
				count++;
			}
		}
	}
	else {
		for (i = 0; i < elements.length; i++) {
			var form_elem = elements[i];
			if (form_elem.checked == true) {
				p[count] = form_elem.id;
				count++;
				p[count] = form_elem.value;
				count++;
			}
		}
	}
	var output;
	Observation.identifier[0].system = document.URL;
	Observation.identifier[0].value = formID;
	Observation.code.coding[0].code = formCode;
	Observation.status = "final";
	Observation.code.coding[0].system = "http://hl7.org/fhir/STU3/valueset-observation-codes.html";
	Observation.code.coding[0].Display = "Physical findings of Breasts Narrative";
	Observation.subject.reference = "Patient/" + p[0];
	var query = location.search.substring(1);
	var paramsStr = query.split("&");
	for (i = 0; i < paramsStr.length; i++) {
		val = paramsStr[i].split("=");
		params[val[0]] = val[1];
	}
	var obsTarget_type;
	if (formID == 'mass') {
		obsTarget_type = massObservation;
	}

	if (formID == 'calcifications') {
		// calcificationObservation.derivedFrom[0].reference = "Observation/" + params["annotationID"];
		// calcificationObservation.valueCodeableConcept.coding[0].code = p[1];
		// calcificationObservation.component[0].code.coding[0].code = p[3];
		// calcificationObservation.component[0].code.coding[1].code = p[5];
		// calcificationObservation.component[1].code.coding[0].code = p[7];
		// calcificationObservation.component[2].code.coding[0].code = p[9];
		// output = Object.assign(Observation, calcificationObservation);
		obsTarget_type = calcificationObservation;
	}
	if (formID == 'asymmetry') {
		// asymetryObservation.derivedFrom[0].reference = "Observation/" + params["annotationID"];
		// asymetryObservation.valueCodeableConcept.coding[0].code = p[1];
		// asymetryObservation.component[0].code.coding[0].code = p[3];
		// asymetryObservation.component[0].code.coding[1].code = p[5];
		// output = Object.assign(Observation, asymetryObservation);
		obsTarget_type = asymetryObservation;
	}
	if (formID == 'architecturalDistortion') {
		// architecturalDistortionObservation.derivedFrom[0].reference = "Observation/" + params["annotationID"];
		// architecturalDistortionObservation.valueCodeableConcept.coding[0].code = p[1];
		// architecturalDistortionObservation.component[0].code.coding[0].code = p[3];
		// architecturalDistortionObservation.component[0].code.coding[1].code = p[5];
		// output = Object.assign(Observation, architecturalDistortionObservation);
		obsTarget_type = architecturalDistortionObservation;
	}
	if (formID != 'QuestionCheck') {
		obsTarget_type.derivedFrom[0].reference = "Observation/" + params["annotationID"];
		obsTarget_type.valueCodeableConcept.coding[0].code = p[1];
		obsTarget_type.valueCodeableConcept.coding[0].display = p[2];
		obsTarget_type.component[0].code.coding[0].code = p[3];
		obsTarget_type.component[0].code.coding[0].display = p[4];
		obsTarget_type.component[0].code.coding[1].code = p[5];
		obsTarget_type.component[0].code.coding[1].display = p[6];

		for (var i = 1; i < obsTarget_type.component.length; i++) {
			var P_index = i + 6 + (i - 1);
			obsTarget_type.component[i].code.coding[0].code = p[P_index];
			obsTarget_type.component[i].code.coding[0].display = p[P_index + 1];
		}
		output = Object.assign(Observation, obsTarget_type);
	}
	else if (formID == 'QuestionCheck') {
		var arrID = [], arrValue = [];
		arrID.push(document.querySelector('input[name="Category"]:checked').id);
		arrValue.push(document.querySelector('input[name="Category"]:checked').value);
		if (document.querySelector('input[name="Category"]:checked').id == "Category4") {
			arrID.push(document.querySelector('input[name="Category4"]:checked').id);
			arrValue.push(document.querySelector('input[name="Category4"]:checked').value);
		}
		var que = ["RetractionSkin_", "ThickeningSkin_", "DilatedLactiferous_", "EnlargedAxillary_"];
		for (i = 0; i < que.length; i++) {
			for (j = 0; j < 2; j++) {
				var queID = que[i] + j;
				var a = document.getElementById(queID);
				if (a.checked == true) {
					arrID.push(a.id);
					arrValue.push(a.value);
				}
			}
		}
		ArrayFID = ArrayFID.split(",");

		DiagnosticReport.subject.reference = patientStudy_ID;
		DiagnosticReport.imagingStudy.reference = "ImagingStudy/" + ImagingStudy_ID;
		for (var i = 0; i < ArrayFID.length; i++) {
			var ref = {};
			var x = ArrayFID[i]
			ref["reference"] = "Observation/" + x;
			DiagnosticReport.result.push(ref);
		}
		var today = new Date();
		var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		var dateTime = date + 'T' + time;
		//DiagnosticReport.issued = Date.parse(dateTime);
		for (var i = 0; i < arrID.length; i++) {
			var conclusion = {};
			conclusion["system"] = arrID[i];
			conclusion["code"] = arrID[i];
			conclusion["display"] = arrValue[i];
			DiagnosticReport.conclusionCode[0].coding.push(conclusion);
		}
		postData(DiagnosticReport, "DiagnosticReport", "");
	}
	if (formID != 'QuestionCheck') postData(output, "Observation", formID);
}

function diagnosisXML() {
	var i, j, p1, p2, p3, p4, p5, p6, p7, p8, p9 = "", len, temp, str = '', str2 = '', output = '';
	p1 = document.getElementById("pId").value;
	p2 = document.getElementById("pName").value;
	p3 = document.getElementById("birthDate").value;
	p4 = "Patient/112441"
	p5 = document.getElementById("examineDate").value;
	p6 = "Practitioner/AJN0050605011970N1"
	p7 = document.getElementById("radiologistName").value;
	temp = document.getElementsByName("category");
	for (i = 0; i < temp.length; i++) {
		if (temp[i].checked == true) {
			p8 = temp[i].value;;
			if (i == 2) {
				temp = document.getElementsByName("suspicion");
				for (j = 0; j < temp.length; j++) {
					if (temp[j].checked == true) {
						p8 += temp[j].value + '"/></DiagnosticReport>';
					}
				}
			}
			if (i != 2) {
				p8 += '"/></DiagnosticReport>'
			}
			break;
		}
	}

	if (document.getElementById("Q1").checked == true) {
		if (document.getElementById("Q1_rt").checked == true)
			p9 = document.getElementById("Q1_rt").value;
		if (document.getElementById("Q1_lt").checked == true)
			p9 += document.getElementById("Q1_lt").value;
		str += '<result><identifier><system value="http://www.radlex.org"/><value value="RID28509_' + p9 + '"/></identifier></result>';
	}
	if (document.getElementById("Q2").checked == true) {
		if (document.getElementById("Q2_rt").checked == true)
			p9 = document.getElementById("Q1_rt").value;
		if (document.getElementById("Q2_lt").checked == true)
			p9 += document.getElementById("Q1_lt").value;
		str += '<result><identifier><system value="http://www.radlex.org"/><value value="RID1357_' + p9 + '"/></identifier></result>';
	}
	if (document.getElementById("Q3").checked == true) {
		if (document.getElementById("Q3_rt").checked == true)
			p9 = document.getElementById("Q1_rt").value;
		if (document.getElementById("Q3_lt").checked == true)
			p9 += document.getElementById("Q1_lt").value;
		str += '<result><identifier><system value="http://www.radlex.org"/><value value="RID49972_' + p9 + '"/></identifier></result>';
	}
	if (document.getElementById("Q4").checked == true) {
		if (document.getElementById("Q4_rt").checked == true)
			p9 = document.getElementById("Q1_rt").value;
		if (document.getElementById("Q4_lt").checked == true)
			p9 += document.getElementById("Q1_lt").value;
		str += '<result><identifier><system value="http://www.radlex.org"/><value value="RID34317_' + p9 + '"/></identifier></result>';
	}
	if (document.getElementById("Q5").checked == true) {
		str += '<result><identifier><system value="http://www.snomed.org"/><value value="74964007_' + document.getElementById("Q5_answer").value + '"/></identifier></result>';
	}

	for (i = 0; i < cmass[0]; i++) {
		str2 += '<result><reference value="Observation/' + cmass[i + 1] + '"/><identifier><system value="http://www.radlex.org"/><value value="RID39055"/></identifier></result>';
	}
	for (i = 0; i < ccal[0]; i++) {
		str2 += '<result><reference value="Observation/' + ccal[i + 1] + '"/><identifier><system value="http://www.radlex.org"/><value value="RID34642"/></identifier></result>';
	}
	for (i = 0; i < casym[0]; i++) {
		str2 += '<result><reference value="Observation/' + casym[i + 1] + '"/><identifier><system value="http://www.radlex.org"/><value value="RID34265"/></identifier></result>';
	}
	for (i = 0; i < cdistort[0]; i++) {
		str2 += '<result><reference value="Observation/' + cdistort[i + 1] + '"/><identifier><system value="http://www.radlex.org"/><value value="RID34261"/></identifier></result>';
	}

	output += '<?xml version="1.0" encoding="UTF-8"?><DiagnosticReport xmlns="http://hl7.org/fhir" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://hl7.org/fhir fhir-all-xsd/diagnosticreport.xsd">';
	output += '<Patient><id value="' + p1 + '"/><text><status value="generated"/><div xmlns="http://www.w3.org/1999/xhtml"><h1>病患資料顯示</h1></div></text><active value="true"/><name><use value="usual"/><text value="' + p2 + '"/></name><gender value="female"/><birthDate value="' + p3 + '"/></Patient>';
	output += '<status value="final"/><code><coding><system value="http://loinc.org"/><code value="24606-6"/></coding><text value="MG Breast Screening"/></code><subject><reference value="' + p4 + '"/></subject><effectiveDateTime value="' + p5 + '"/>';
	output += '<performer><role><coding><system value="http://hl7.org/fhir/ValueSet/performer-role"/><code value="41904004"/><display value="Medical X-ray technician"/></coding></role><actor><reference value="' + p6 + '"/><display value="' + p7 + '"/></actor></performer>';
	output += str2 + str + '<conclusion value="' + p8;

	//alert(output);
	postData(output, "DiagnosticReport", "");
}

var cmass = new Array(15), ccal = new Array(15), casym = new Array(15), cdistort = new Array(15), cQuesCheck = new Array(15);
var cline = [], crect = [], cellipse = [];
cmass[0] = 0; ccal[0] = 0; casym[0] = 0; cdistort[0] = 0; cQuesCheck[0] = 0;
function diagnosisJSON(findingID) {
	findingID = findingID.split(",");

	DiagnosticReport.subject.reference = "Patient/1168613";
	for (var i = 0; i < findingID.length; i++) {
		var ref = {};
		var x = findingID[i]
		ref["reference"] = x;
		DiagnosticReport.result.push(ref);
	}
	// var today = new Date();
	// var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	// var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	// var dateTime = date + ' ' + time;
	// DiagnosticReport.issued = date;

}
function postData(jsonString, type, formID) {
	var xhttp = new XMLHttpRequest();
	//var url = "http://hapi.fhir.org/baseR4/" + type;	//"http://203.64.84.213:8080/hapi-fhir-jpaserver/fhir/Observation";	//http://hapi.fhir.org/baseR4/Observation //'https://hapi.fhir.tw/fhir/Observation';	//'http://hapi.fhir.org/baseDstu3/Observation';
	var url = fhir.url + type;
	xhttp.open("POST", url, false);
	xhttp.setRequestHeader("Content-type", 'application/json');
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) // && this.status == 201) 
		{
			ret = JSON.parse(this.responseText);
			//alert(this.responseText);
			// var str = ret.split('<id value="');
			// var str2 = str[1].split('"/');
			obsID = ret.id;
			alert("FHIR Observation ID: " + ret.id);

			if (formID == 'mass') {
				cmass[cmass[0]] = ret.id;
			}
			if (formID == 'calcifications')
				ccal[ccal[0]] = ret.id;
			if (formID == 'asymmetry')
				casym[casym[0]] = ret.id;
			if (formID == 'architecturalDistortion')
				cdistort[cdistort[0]] = ret.id;
			if (formID == 'mass' || formID == 'calcifications' || formID == 'asymmetry' || formID == 'architecturalDistortion') {
				try {
					window.opener.HandlePopupResult(ret.id, params["rowNum"], params["findingType"]);
				}
				catch (err) { }
				window.close();
				return false;
			}
			if (formID == 'text')
				ctext.push(ret.id);
			if (formID == 'line')
				cline.push(ret.id);
			if (formID == 'rectangle')
				crect.push(ret.id);
			if (formID == 'ellipse')
				cellipse.push(ret.id);

		}
	};
	var data = JSON.stringify(jsonString);
	//alert(data);
	xhttp.send(data);
}

function postReportData(jsonString, type, formID) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", 'http://hapi.fhir.org/baseDstu3/' + type, true);
	xhttp.setRequestHeader("Content-type", 'text/xml');
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) // && this.status == 201) 
		{
			ret = this.responseText;
			//alert(ret);
			var str = ret.split('<id value="');
			var str2 = str[1].split('"/');
			//alert(str2[0]);
			if (formID == 'mass')
				cmass[cmass[0]] = str2[0];
			if (formID == 'calcifications')
				ccal[ccal[0]] = str2[0];
			if (formID == 'asymmetry')
				casym[casym[0]] = str2[0];
			if (formID == 'architecturalDistortion')
				cdistort[cdistort[0]] = str2[0];
		}
	};
	var postData;
	postData = jsonString;
	xhttp.send(postData);
}

function setCookie(cname, cvalue, exmin) {
	var d = new Date();
	d.setTime(d.getTime() + (exmin * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function check(p) {
	if (p.id == "mass")
		cmass[0]++;
	if (p.id == "calcifications")
		ccal[0]++;
	if (p.id == "asymmetry")
		casym[0]++;
	if (p.id == "architecturalDistortion")
		cdistort[0]++;
	if (p.id == "QuestionCheck")
		cQuesCheck[0]++;

	var thisform = document.getElementById(p.id);
	var elements = thisform.elements, count = 0, checkcount = 0;
	if (p.id == "QuestionCheck") { checkcount = 0 }
	else {
		for (i = 0; i < elements.length; i++) {
			if (elements[i].checked == true)
				count++;
		}
		if (p.id == "mass" && count != 7)
			checkcount = 1;
		if (p.id == "calcifications" && count != 5)
			checkcount = 1;
		if ((p.id == "asymmetry" || p.id == "architecturalDistortion") && count != 3)
			checkcount = 1;
	}
	if (checkcount != 0)
		alert(p.id + "未勾選完畢");
	else {
		mammoXML(p.id, p.name);
		if (p.id == "QuestionCheck") {
			var que = ["RetractionSkin_", "ThickeningSkin_", "DilatedLactiferous_", "EnlargedAxillary_"];
			for (i = 0; i < que.length; i++) {
				for (j = 0; j < 2; j++) {
					p[count] = que[i] + j;
					document.getElementById(p[count]).checked = false;
				}
			} document.getElementById("Q5_answer").value = "";
		} else {
			for (i = 0; i < elements.length; i++) {
				if (elements[i].checked == true)
					elements[i].checked = false;
			}
		}
	}
}