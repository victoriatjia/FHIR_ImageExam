var observationID = '';
var ArrayFID;
var params = {};
var patientStudy_ID, ImagingStudy_ID, DRObservation, modality, DR_ID;


function formInputsToXML(type, URL, uid, svgBase64, vw, vh, wc, ww, pixelData, dcmFile, annotationType) {
	var baseURL = "https://www.dicom.org.tw/";
	Observation.identifier[0].system = URL;
	Observation.identifier[0].value = uid;
	Observation.status = "final";
	Observation.code.coding[0].code = type;
	//Observation.subject.reference = "Patient/" + p[0];
	annotationObservation.component[0].valueString = svgBase64;
	annotationObservation.component[1].valueString = vw;
	annotationObservation.component[2].valueString = vh;
	annotationObservation.component[3].valueString = wc;
	annotationObservation.component[4].valueString = ww;
	annotationObservation.component[5].valueString = pixelData;
	annotationObservation.component[6].valueString = dcmFile;
	output = Object.assign(Observation, annotationObservation);
	//alert(output);
	postData(output, "Observation", annotationType);
}

function getsession() {
	ArrayFID = sessionStorage.getItem('findingID');
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
	getParams();
	var output;
	Observation.identifier[0].system = document.URL;
	Observation.identifier[0].value = formID;
	Observation.code.coding[0].code = formCode;
	Observation.status = "final";
	Observation.code.coding[0].system = "http://hl7.org/fhir/STU3/valueset-observation-codes.html";
	Observation.code.coding[0].Display = "Physical findings of Breasts Narrative";
	Observation.subject.reference = "Patient/" + params["patientStudyID"];

	var obsTarget_type;
	if (formID == 'mass') obsTarget_type = massObservation;
	if (formID == 'calcifications') obsTarget_type = calcificationObservation;
	if (formID == 'asymmetry') obsTarget_type = asymetryObservation;
	if (formID == 'architecturalDistortion') obsTarget_type = architecturalDistortionObservation;
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
		//var typearr = typeof (ArrayFID);
		ArrayFID = (typeof (ArrayFID) == "string") ? ArrayFID.split(",") : ArrayFID;

		DiagnosticReport.subject.reference = "Patient/" + params["patientStudyID"];
		DiagnosticReport.imagingStudy.reference = "ImagingStudy/" + params["imagingStudyID"];
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
		postData(DiagnosticReport, "DiagnosticReport", formID);
	}
	if (formID != 'QuestionCheck') postData(output, "Observation", formID);
}
function getParams() {
	var query = location.search.substring(1);
	var paramsStr = query.split("&");
	for (i = 0; i < paramsStr.length; i++) {
		val = paramsStr[i].split("=");
		params[val[0]] = val[1];
	}

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
			alert(this.responseText);
			observationID = ret.id;
			//alert("FHIR Observation ID: " + ret.id);

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
			if (formID == 'QuestionCheck') {
				try {
					window.opener.HandlePopupResultDR(ret.id);
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