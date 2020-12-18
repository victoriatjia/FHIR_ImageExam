//GET FHIR value
function getFHIR(val) {
	//var val = document.getElementById("fhirObsID").value;
	initialization();
	var FHIRObsSource = "http://hapi.fhir.org/baseR4/Observation/";	//"http://203.64.84.213:8080/hapi-fhir-jpaserver/fhir/Observation/"; //"http://hapi.fhir.org/baseR4/Observation/";	//1421748 //1421745"; //1420949";	//1420865";	//MR= 8557 //8559: normal size(2560 & 3328), 8473= 1/4 size (640 & 832), 8561(rect normal size)	//CT= 8587
	FHIRObsSource += val;

	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", FHIRObsSource, true);
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) {
			showOutput(this.responseText);
		}
	};
	xhttp.send();
}

function showOutput(str) {
	var jsonOBJ = JSON.parse(str);
	//alert(jsonOBJ);
	if (jsonOBJ.total == 0) alert('data unexist');
	else {
		samplesPerPixel = 1;
		storedBytes = 2;
		modalityType = jsonOBJ.code.coding[0].code;
		UID = jsonOBJ.identifier[0].value;
		sourceImage.width = parseInt(jsonOBJ.component[1].valueString);
		sourceImage.height = parseInt(jsonOBJ.component[2].valueString);
		windowCenter = parseInt(jsonOBJ.component[3].valueString);
		windowWidth = parseInt(jsonOBJ.component[4].valueString);
		pixelDataOffset = parseInt(jsonOBJ.component[5].valueString);
		dcmFile = jsonOBJ.component[6].valueString;
		var base64 = jsonOBJ.component[0].valueString;
		var svg = atob(base64);
		var svgIndex = 0;
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(svg, "text/xml");
		if (xmlDoc.getElementsByTagName("text")[svgIndex] != null) {
			var type = xmlDoc.getElementsByTagName("text")[svgIndex];
			var x = type.getAttribute('x');
			var y = type.getAttribute('y');
			var val = type.childNodes[0].nodeValue;
			var fontColor = type.getAttribute('fill');
			var fontSize = type.getAttribute('font-size');

			svgText[text][0] = x;
			svgText[text][1] = y;
			svgText[text][2] = val;
			svgText[text][3] = fontColor;
			svgText[text][4] = fontSize + "px Arial";
			text++;
			svgIndex++;
		}
		else if (xmlDoc.getElementsByTagName("line")[svgIndex] != null) {
			var type = xmlDoc.getElementsByTagName("line")[svgIndex];
			var x1 = type.getAttribute('x1');
			var y1 = type.getAttribute('y1');
			var x2 = type.getAttribute('x2');
			var y2 = type.getAttribute('y2');
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgLine[line][0] = parseInt(x1);
			svgLine[line][1] = parseInt(y1);
			svgLine[line][2] = parseInt(x2);
			svgLine[line][3] = parseInt(y2);
			svgLine[line][4] = strokeColor;
			svgLine[line][5] = parseInt(strokeWidth);
			line++;
			svgIndex++;
		}
		else if (xmlDoc.getElementsByTagName("ellipse")[svgIndex] != null) {
			var type = xmlDoc.getElementsByTagName("ellipse")[svgIndex];
			var cx = type.getAttribute('cx');
			var cy = type.getAttribute('cy');
			var rx = type.getAttribute('rx');
			var ry = type.getAttribute('ry');
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgEllipse[ellipse][0] = parseInt(cx);
			svgEllipse[ellipse][1] = parseInt(cy);
			svgEllipse[ellipse][2] = parseInt(rx);
			svgEllipse[ellipse][3] = parseInt(ry);
			svgEllipse[ellipse][4] = strokeColor;
			svgEllipse[ellipse][5] = strokeWidth;
			ellipse++;
			svgIndex++;
		}
		else if (xmlDoc.getElementsByTagName("rect")[svgIndex] != null) {
			var type = xmlDoc.getElementsByTagName("rect")[svgIndex];
			var x = parseInt(type.getAttribute('x'));
			var y = parseInt(type.getAttribute('y'));
			var w = parseInt(type.getAttribute('width'));
			var h = parseInt(type.getAttribute('height'));
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgRect[rect][0] = x;
			svgRect[rect][1] = y;
			svgRect[rect][2] = x + w;
			svgRect[rect][3] = y + h;
			svgRect[rect][4] = strokeColor;
			svgRect[rect][5] = strokeWidth;
			rect++;
			svgIndex++;
		}
		var xmlText = new XMLSerializer().serializeToString(xmlDoc);
	}
	getDCM("B");
}
//END GET FHIR VALUE

var byteArray;
//GET ORIGINAL .DCM VALUE
function findMetaData(ret) {
	byteArray = new Uint8Array(ret);
	var imgLength = dicomData.byteLength;
	var instanceUIDTag = ["00", "08", "00", "18"];
	var pixeldataTag = ["7F", "E0", "00", "10"];  		//7F E0,00 10  or  E0 7F, 10 00
	var rowTag = ["00", "28", "00", "10"];				//row (0028, 0010)
	var columnTag = ["00", "28", "00", "11"];			//column (0028, 0011)
	var sampleperpixelTag = ["00", "28", "00", "02"];	//sample perpixel(0028, 0002)
	var bitstoredTag = ["00", "28", "01", "01"];
	var windowcenterTag = ["00", "28", "10", "50"];		//windowwcenter	(0028, 1050)
	var windowwidthTag = ["00", "28", "10", "51"];		//windowwidth (0028, 1051)
	var modalityTag = ["00", "08", "00", "60"];			//modality (0008, 0060)

	instanceUIDTag = hextobin(instanceUIDTag);
	pixeldataTag = hextobin(pixeldataTag);
	rowTag = hextobin(rowTag);
	columnTag = hextobin(columnTag);
	sampleperpixelTag = hextobin(sampleperpixelTag);
	bitstoredTag = hextobin(bitstoredTag);
	windowcenterTag = hextobin(windowcenterTag);
	windowwidthTag = hextobin(windowwidthTag);
	modalityTag = hextobin(modalityTag);

	var endian = checkEndian();
	if (endian == "little") {
		instanceUIDTag = swap(instanceUIDTag);
		pixeldataTag = swap(pixeldataTag);
		rowTag = swap(rowTag);
		columnTag = swap(columnTag);
		sampleperpixelTag = swap(sampleperpixelTag);
		bitstoredTag = swap(bitstoredTag);
		windowcenterTag = swap(windowcenterTag);
		windowwidthTag = swap(windowwidthTag);
		modalityTag = swap(modalityTag);
	}

	UID = "", sourceImage.height = 0, sourceImage.width = 0, samplesPerPixel = -1;
	for (i = 0; i < imgLength; i++) {
		var x = 0;
		if (byteArray[i + 4] == 79) x = 12;	// 'O' ASCII =79, 'S'=83,'U'=85 //explicit with vrOffset and value length 4 byte
		else x = 8;							//implicit without vrOffset

		if (UID == "" && byteArray[i] == instanceUIDTag[0] && byteArray[i + 1] == instanceUIDTag[1] && byteArray[i + 2] == instanceUIDTag[2] && byteArray[i + 3] == instanceUIDTag[3])
			UID = findValue((i + x), (i + 4), "UI", endian);

		if (byteArray[i] == pixeldataTag[0] && byteArray[i + 1] == pixeldataTag[1] && byteArray[i + 2] == pixeldataTag[2] && byteArray[i + 3] == pixeldataTag[3])
			pixelDataOffset = (i + x);

		if (sourceImage.height == 0 && byteArray[i] == rowTag[0] && byteArray[i + 1] == rowTag[1] && byteArray[i + 2] == rowTag[2] && byteArray[i + 3] == rowTag[3])
			sourceImage.height = findValue((i + x), (i + 4), "US", endian);

		if (sourceImage.width == 0 && byteArray[i] == columnTag[0] && byteArray[i + 1] == columnTag[1] && byteArray[i + 2] == columnTag[2] && byteArray[i + 3] == columnTag[3])
			sourceImage.width = findValue((i + x), (i + 4), "US", endian);

		if (samplesPerPixel == -1 && byteArray[i] == sampleperpixelTag[0] && byteArray[i + 1] == sampleperpixelTag[1] && byteArray[i + 2] == sampleperpixelTag[2] && byteArray[i + 3] == sampleperpixelTag[3])
			samplesPerPixel = findValue((i + x), (i + 4), "US", endian);

		if (byteArray[i] == bitstoredTag[0] && byteArray[i + 1] == bitstoredTag[1] && byteArray[i + 2] == bitstoredTag[2] && byteArray[i + 3] == bitstoredTag[3]) {
			var bitsStoredvalue = findValue((i + x), (i + 4), "US", endian)
			storedBytes = Math.round(bitsStoredvalue / 8);
		}

		if (byteArray[i] == windowcenterTag[0] && byteArray[i + 1] == windowcenterTag[1] && byteArray[i + 2] == windowcenterTag[2] && byteArray[i + 3] == windowcenterTag[3])
			windowCenter = findValue((i + x), (i + 4), "DS", endian);

		if (byteArray[i] == windowwidthTag[0] && byteArray[i + 1] == windowwidthTag[1] && byteArray[i + 2] == windowwidthTag[2] && byteArray[i + 3] == windowwidthTag[3])
			windowWidth = findValue((i + x), (i + 4), "DS", endian);

		if (byteArray[i] == modalityTag[0] && byteArray[i + 1] == modalityTag[1] && byteArray[i + 2] == modalityTag[2] && byteArray[i + 3] == modalityTag[3])
			modalityType = findValue((i + x), (i + 4), "CS", endian);
	}
}

function checkEndian() {
	var endian;
	var b = ["7F", "E0", "00", "10"];  //7F E0,00 10  or  E0 7F, 10 00
	b = hextobin(b);
	for (i = 0; i < byteArray.byteLength; i++) {
		if (byteArray[i] == b[0] && byteArray[i + 1] == b[1] && byteArray[i + 2] == b[2] && byteArray[i + 3] == b[3]) {
			endian = "big";
		}
		if (byteArray[i] == b[1] && byteArray[i + 1] == b[0] && byteArray[i + 2] == b[3] && byteArray[i + 3] == b[2]) {
			endian = "little";
		}
	}
	return endian;
}

function swap(array) {
	var x = array[0];
	array[0] = array[1];
	array[1] = x;
	x = array[2];
	array[2] = array[3];
	array[3] = x;
	return array;
}

function hextobin(array) {
	for (var x = 0; x < array.length; x++) {
		array[x] = parseInt(array[x], 16);
	}
	return array;
}

function findValue(offsetValue, vrOffset, vrname, endian) {
	var valueReturn, valuevrOffset = 0;
	//find valueLength size
	if ((byteArray[vrOffset] == 79 && (byteArray[vrOffset + 1] == 66 || byteArray[vrOffset + 1] == 87 || byteArray[vrOffset + 1] == 70)) || (byteArray[vrOffset] == 85 && (byteArray[vrOffset + 1] == 84 || byteArray[vrOffset + 1] == 78)) || (byteArray[vrOffset] == 83 && byteArray[vrOffset + 1] == 81))
		valuevrOffset = 4;
	else if (byteArray[vrOffset] > 57) valuevrOffset = 2;
	else valuevrOffset = 4;

	var valueLen = []; //find valuelength value
	for (var j = (offsetValue - 1); j >= (offsetValue - valuevrOffset); j--) {
		valueLen.push((byteArray[j]).toString(16));
	}
	if (endian == "big") valueLen = valueLen.reverse();
	valueLen = valueLen.join("");
	valueLen = parseInt(valueLen, 16);

	//find value
	if (vrname == 'US') {// vrOffset == 'US'
		var hexString = [];
		for (var j = valueLen - 1; j >= 0; j--) {//002()
			var hex;
			if (endian == "little") {
				hex = (byteArray[offsetValue + j] > 9) ? (byteArray[offsetValue + j]).toString(16) : ("0" + (byteArray[offsetValue + j]).toString(16));
			}
			else {
				hex = (byteArray[offsetValue + j]).toString(16);
			}
			hexString.push(hex);
		}
		if (endian == "big") hexString = hexString.reverse();
		hexString = hexString.join("");
		hexString = parseInt(hexString, 16); //200->512
		valueReturn = hexString;
	}
	else if (vrname == 'DS') {//vrOffset == 'DS'
		var hexString = '';
		for (var j = 0; j < valueLen; j++) {
			var hex = String.fromCharCode(byteArray[offsetValue + j]);
			hexString += hex;
		}
		valueReturn = parseInt(hexString);
	}
	else if (vrname == 'CS' || vrname == 'UI') {//vrOffset == 'CS'
		var hexString = '';
		for (var j = 0; j < valueLen; j++) {
			var ascii = byteArray[offsetValue + j];
			if (ascii != 0) hexString += String.fromCharCode(ascii);
		}
		valueReturn = hexString;
	}
	return valueReturn;
}

var minPixel = 99999, maxPixel = -99999;
function findMinMaxPixelValue() {

	for (y = 0; y < sourceImage.height; y++) {
		for (x = 0; x < sourceImage.width; x++) {
			// Get DICOM image pixel index
			dicomPixelIndex = (y * sourceImage.width + x) * samplesPerPixel * storedBytes + pixelDataOffset;
			pixelValue = dicomData.getUint16(dicomPixelIndex, true); // true for littel endian
			if (pixelValue > maxPixel) maxPixel = pixelValue;
			if (pixelValue < minPixel) minPixel = pixelValue;
		}
	}
	maxPixelValue = maxPixel;
	minPixelValue = minPixel;
}

var lut = new Array();
function generateLUT() {
	let grayValue;
	maxPixelValue = Math.round(windowCenter + windowWidth / 2);
	minPixelValue = Math.round(windowCenter - windowWidth / 2);
	for (let storedValue = minPixel; storedValue <= maxPixel; storedValue++) {
		if (storedValue >= maxPixelValue) grayValue = 255;
		else if (minPixelValue > storedValue) grayValue = 0;
		else grayValue = Math.round((storedValue - minPixelValue) / windowWidth * 256);

		lut[storedValue + (-minPixelValue)] = grayValue;
	}
}

function storedPixelValueToCanvas(ctx, scaleWidth, scaleHeight, pPanX, pPanY) {
	let grayValue, canvasPixelIndex;
	imageData = ctx.getImageData(0, 0, scaleWidth, scaleHeight)		//seolah2 taro di canvas baru dgn size ssuai size ori image (vw & vh)
	for (y = 0; y < scaleHeight; y++) {
		for (x = 0; x < scaleWidth; x++) {
			pixelx = parseInt(x * (sourceImage.width / scaleWidth));
			pixely = parseInt(y * (sourceImage.height / scaleHeight));

			if (pixelx >= 0 && pixelx < sourceImage.width && pixely >= 0 && pixely < sourceImage.height) {
				dicomPixelIndex = (pixely * sourceImage.width + pixelx) * samplesPerPixel * storedBytes + pixelDataOffset;
				pixelValue = dicomData.getUint16(dicomPixelIndex, true); // true for littel endian
				grayValue = lut[pixelValue + (-minPixelValue)];

				canvasPixelIndex = (y * scaleWidth + x) * 4;

				imageData.data[canvasPixelIndex] = grayValue;
				imageData.data[canvasPixelIndex + 1] = grayValue;
				imageData.data[canvasPixelIndex + 2] = grayValue;
				imageData.data[canvasPixelIndex + 3] = 255;
			}
			else {
				imageData.data[canvasPixelIndex] = 0;     // Red
				imageData.data[canvasPixelIndex + 1] = 0; // Green
				imageData.data[canvasPixelIndex + 2] = 0;  // Blue
				imageData.data[canvasPixelIndex + 3] = 255;   // Alpha
			}
		}
	}
	ctx.putImageData(imageData, pPanX, pPanY);
}
//END GET ORIGINAL .DCM VALUE

//compareAnswer used function
function getFHIREdu(id, type) {
	initialization();
	var FHIRObsSource = "http://hapi.fhir.org/baseR4/Observation/";	//"http://203.64.84.213:8080/fhir/Observation/";
	FHIRObsSource += id;

	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", FHIRObsSource, true);
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) {
			if (type == "stuAnswer") showOutput2(this.responseText);
			else showTeacherAnswer(this.responseText);
		}
	};
	xhttp.send();
}

function showTeacherAnswer(str) {
	var jsonOBJ = JSON.parse(str);
	var base64 = jsonOBJ.component[0].valueString;
	var svg = atob(base64);
	var svgIndex = 0;
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(svg, "text/xml");
	for (var i = 0; i < xmlDoc.getElementsByTagName("text").length; i++) {
		var type = xmlDoc.getElementsByTagName("text")[i];
		var x = type.getAttribute('x');
		var y = type.getAttribute('y');
		var val = type.childNodes[0].nodeValue;
		var fontColor = type.getAttribute('fill');
		var fontSize = type.getAttribute('font-size');

		svgText2[text2][0] = parseInt(x);
		svgText2[text2][1] = parseInt(y);
		svgText2[text2][2] = val;
		svgText2[text2][3] = fontColor;
		svgText2[text2][4] = fontSize + "px Arial";
		text2++;
	}

	for (var i = 0; i < xmlDoc.getElementsByTagName("line").length; i++) {
		var type = xmlDoc.getElementsByTagName("line")[i];
		var x1 = type.getAttribute('x1');
		var y1 = type.getAttribute('y1');
		var x2 = type.getAttribute('x2');
		var y2 = type.getAttribute('y2');
		var strokeColor = type.getAttribute('stroke');
		var strokeWidth = parseInt(type.getAttribute('stroke-width'));

		svgLine2[line2][0] = parseInt(x1);
		svgLine2[line2][1] = parseInt(y1);
		svgLine2[line2][2] = parseInt(x2);
		svgLine2[line2][3] = parseInt(y2);
		svgLine2[line2][4] = strokeColor;
		svgLine2[line2][5] = parseInt(strokeWidth);
		line2++;
	}

	for (var i = 0; i < xmlDoc.getElementsByTagName("ellipse").length; i++) {
		var type = xmlDoc.getElementsByTagName("ellipse")[i];
		var cx = type.getAttribute('cx');
		var cy = type.getAttribute('cy');
		var rx = type.getAttribute('rx');
		var ry = type.getAttribute('ry');
		var strokeColor = type.getAttribute('stroke');
		var strokeWidth = parseInt(type.getAttribute('stroke-width'));

		svgEllipse2[ellipse2][0] = parseInt(cx);
		svgEllipse2[ellipse2][1] = parseInt(cy);
		svgEllipse2[ellipse2][2] = parseInt(rx);
		svgEllipse2[ellipse2][3] = parseInt(ry);
		svgEllipse2[ellipse2][4] = strokeColor;
		svgEllipse2[ellipse2][5] = strokeWidth;
		ellipse2++;
	}

	for (var i = 0; i < xmlDoc.getElementsByTagName("rect").length; i++) {
		var type = xmlDoc.getElementsByTagName("rect")[i];
		var x = parseInt(type.getAttribute('x'));
		var y = parseInt(type.getAttribute('y'));
		var w = parseInt(type.getAttribute('width'));
		var h = parseInt(type.getAttribute('height'));
		var strokeColor = type.getAttribute('stroke');
		var strokeWidth = parseInt(type.getAttribute('stroke-width'));

		svgRect2[rect2][0] = x;
		svgRect2[rect2][1] = y;
		svgRect2[rect2][2] = x + w;
		svgRect2[rect2][3] = y + h;
		svgRect2[rect2][4] = strokeColor;
		svgRect2[rect2][5] = strokeWidth;
		rect2++;
	}
	var xmlText = new XMLSerializer().serializeToString(xmlDoc);
	redrawAnnotation(ctx2, 2);
}

function showOutput2(str) {
	var jsonOBJ = JSON.parse(str);
	//alert(jsonOBJ);
	if (jsonOBJ.total == 0) alert('data unexist');
	else {
		samplesPerPixel = 1;
		storedBytes = 2;
		modalityType = jsonOBJ.code.coding[0].code;
		UID = jsonOBJ.identifier[0].value;
		sourceImage.width = parseInt(jsonOBJ.component[1].valueString);
		sourceImage.height = parseInt(jsonOBJ.component[2].valueString);
		windowCenter = parseInt(jsonOBJ.component[3].valueString);
		windowWidth = parseInt(jsonOBJ.component[4].valueString);
		pixelDataOffset = parseInt(jsonOBJ.component[5].valueString);
		dcmFile = jsonOBJ.component[6].valueString;
		var base64 = jsonOBJ.component[0].valueString;
		var svg = atob(base64);
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(svg, "text/xml");

		for (var i = 0; i < xmlDoc.getElementsByTagName("text").length; i++) {
			var type = xmlDoc.getElementsByTagName("text")[i];
			var x = type.getAttribute('x');
			var y = type.getAttribute('y');
			var val = type.childNodes[0].nodeValue;
			var fontColor = type.getAttribute('fill');
			var fontSize = type.getAttribute('font-size');

			svgText1[text1][0] = parseInt(x);
			svgText1[text1][1] = parseInt(y);
			svgText1[text1][2] = val;
			svgText1[text1][3] = fontColor;
			svgText1[text1][4] = fontSize + "px Arial";
			text1++;
		}

		for (var i = 0; i < xmlDoc.getElementsByTagName("line").length; i++) {
			var type = xmlDoc.getElementsByTagName("line")[i];
			var x1 = type.getAttribute('x1');
			var y1 = type.getAttribute('y1');
			var x2 = type.getAttribute('x2');
			var y2 = type.getAttribute('y2');
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgLine1[line1][0] = parseInt(x1);
			svgLine1[line1][1] = parseInt(y1);
			svgLine1[line1][2] = parseInt(x2);
			svgLine1[line1][3] = parseInt(y2);
			svgLine1[line1][4] = strokeColor;
			svgLine1[line1][5] = parseInt(strokeWidth);
			line1++;
		}

		for (var i = 0; i < xmlDoc.getElementsByTagName("ellipse").length; i++) {
			var type = xmlDoc.getElementsByTagName("ellipse")[i];
			var cx = type.getAttribute('cx');
			var cy = type.getAttribute('cy');
			var rx = type.getAttribute('rx');
			var ry = type.getAttribute('ry');
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgEllipse1[ellipse1][0] = parseInt(cx);
			svgEllipse1[ellipse1][1] = parseInt(cy);
			svgEllipse1[ellipse1][2] = parseInt(rx);
			svgEllipse1[ellipse1][3] = parseInt(ry);
			svgEllipse1[ellipse1][4] = strokeColor;
			svgEllipse1[ellipse1][5] = strokeWidth;
			ellipse1++;
		}

		for (var i = 0; i < xmlDoc.getElementsByTagName("rect").length; i++) {
			var type = xmlDoc.getElementsByTagName("rect")[i];
			var x = parseInt(type.getAttribute('x'));
			var y = parseInt(type.getAttribute('y'));
			var w = parseInt(type.getAttribute('width'));
			var h = parseInt(type.getAttribute('height'));
			var strokeColor = type.getAttribute('stroke');
			var strokeWidth = parseInt(type.getAttribute('stroke-width'));

			svgRect1[rect1][0] = x;
			svgRect1[rect1][1] = y;
			svgRect1[rect1][2] = x + w;
			svgRect1[rect1][3] = y + h;
			svgRect1[rect1][4] = strokeColor;
			svgRect1[rect1][5] = strokeWidth;
			rect1++;
		}
		var xmlText = new XMLSerializer().serializeToString(xmlDoc);
	}
	getDCM();
}
//End compareAnswer used function