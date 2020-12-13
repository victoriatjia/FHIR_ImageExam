//GET FHIR value
	function getFHIREdu(id, type){
		initialization();
		var FHIRObsSource= "http://hapi.fhir.org/baseR4/Observation/";	//"http://203.64.84.213:8080/fhir/Observation/";
		FHIRObsSource+= id;
		
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", FHIRObsSource, true);
		xhttp.onreadystatechange = function (){
			if (this.readyState == 4){ 
				if(type=="stuAnswer") showOutputs(this.responseText);
				else showTeacherAnswer(this.responseText);
			}
		};
		xhttp.send();
	}
	
	function showTeacherAnswer(str){
		var jsonOBJ =JSON.parse(str);
		var base64= jsonOBJ.component[0].valueString;
		var svg= atob(base64);
		var svgIndex=0;
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(svg,"text/xml");
		for(var i= 0; i<xmlDoc.getElementsByTagName("text").length;i++){
			var type= xmlDoc.getElementsByTagName("text")[i];
			var x= type.getAttribute('x');
			var y= type.getAttribute('y');
			var val= type.childNodes[0].nodeValue;
			var fontColor= type.getAttribute('fill');
			var fontSize= type.getAttribute('font-size');
			
			svgText2[text2][0]= parseInt(x);
			svgText2[text2][1]= parseInt(y);
			svgText2[text2][2]= val;
			svgText2[text2][3]= fontColor;
			svgText2[text2][4]= fontSize + "px Arial";
			text2++;
		}
		
		for(var i= 0; i<xmlDoc.getElementsByTagName("line").length;i++){
			var type= xmlDoc.getElementsByTagName("line")[i];
			var x1= type.getAttribute('x1');
			var y1= type.getAttribute('y1');
			var x2= type.getAttribute('x2');
			var y2= type.getAttribute('y2');
			var strokeColor= type.getAttribute('stroke');
			var strokeWidth= parseInt(type.getAttribute('stroke-width'));
			
			svgLine2[line2][0]= parseInt(x1);
			svgLine2[line2][1]= parseInt(y1);
			svgLine2[line2][2]= parseInt(x2);
			svgLine2[line2][3]= parseInt(y2);
			svgLine2[line2][4]= strokeColor;
			svgLine2[line2][5]= parseInt(strokeWidth);
			line2++;
		}
		
		for(var i= 0; i<xmlDoc.getElementsByTagName("ellipse").length;i++){
			var type= xmlDoc.getElementsByTagName("ellipse")[i];
			var cx= type.getAttribute('cx');
			var cy= type.getAttribute('cy');
			var rx= type.getAttribute('rx');
			var ry= type.getAttribute('ry');
			var strokeColor= type.getAttribute('stroke');
			var strokeWidth= parseInt(type.getAttribute('stroke-width'));
			
			svgEllipse2[ellipse2][0]= parseInt(cx);
			svgEllipse2[ellipse2][1]= parseInt(cy);
			svgEllipse2[ellipse2][2]= parseInt(rx);
			svgEllipse2[ellipse2][3]= parseInt(ry);
			svgEllipse2[ellipse2][4]= strokeColor;
			svgEllipse2[ellipse2][5]= strokeWidth;
			ellipse2++;
		}
		
		for(var i= 0; i<xmlDoc.getElementsByTagName("rect").length;i++){
			var type= xmlDoc.getElementsByTagName("rect")[i];
			var x= parseInt(type.getAttribute('x'));
			var y= parseInt(type.getAttribute('y'));
			var w= parseInt(type.getAttribute('width'));
			var h= parseInt(type.getAttribute('height'));
			var strokeColor= type.getAttribute('stroke');
			var strokeWidth= parseInt(type.getAttribute('stroke-width'));
			
			svgRect2[rect2][0]= x;
			svgRect2[rect2][1]= y;
			svgRect2[rect2][2]= x+w;
			svgRect2[rect2][3]= y+h;
			svgRect2[rect2][4]= strokeColor;
			svgRect2[rect2][5]= strokeWidth;
			rect2++;
		}
		var xmlText = new XMLSerializer().serializeToString(xmlDoc);
		redrawAnnotation(ctx2, 2);
	}
	
	function showOutputs(str){
		var jsonOBJ =JSON.parse(str);
		//alert(jsonOBJ);
		if (jsonOBJ.total == 0)	alert('data unexist');
		else{
			samplesPerPixel=1;
			storedBytes=2;
			modalityType= jsonOBJ.code.coding[0].code;
			UID= jsonOBJ.identifier[0].value;
			sourceImage.width= parseInt(jsonOBJ.component[1].valueString);
			sourceImage.height= parseInt(jsonOBJ.component[2].valueString);
			windowCenter= parseInt(jsonOBJ.component[3].valueString);
			windowWidth= parseInt(jsonOBJ.component[4].valueString);
			pixelDataOffset= parseInt(jsonOBJ.component[5].valueString);
			dcmFile= jsonOBJ.component[6].valueString;
			var base64= jsonOBJ.component[0].valueString;
			var svg= atob(base64);
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(svg,"text/xml");
			
			for(var i= 0; i<xmlDoc.getElementsByTagName("text").length;i++){
				var type= xmlDoc.getElementsByTagName("text")[i];
				var x= type.getAttribute('x');
				var y= type.getAttribute('y');
				var val= type.childNodes[0].nodeValue;
				var fontColor= type.getAttribute('fill');
				var fontSize= type.getAttribute('font-size');
				
				svgText1[text1][0]= parseInt(x);
				svgText1[text1][1]= parseInt(y);
				svgText1[text1][2]= val;
				svgText1[text1][3]= fontColor;
				svgText1[text1][4]= fontSize + "px Arial";
				text1++;
			}
			
			for(var i= 0; i<xmlDoc.getElementsByTagName("line").length;i++){
				var type= xmlDoc.getElementsByTagName("line")[i];
				var x1= type.getAttribute('x1');
				var y1= type.getAttribute('y1');
				var x2= type.getAttribute('x2');
				var y2= type.getAttribute('y2');
				var strokeColor= type.getAttribute('stroke');
				var strokeWidth= parseInt(type.getAttribute('stroke-width'));
				
				svgLine1[line1][0]= parseInt(x1);
				svgLine1[line1][1]= parseInt(y1);
				svgLine1[line1][2]= parseInt(x2);
				svgLine1[line1][3]= parseInt(y2);
				svgLine1[line1][4]= strokeColor;
				svgLine1[line1][5]= parseInt(strokeWidth);
				line1++;
			}
			
			for(var i= 0; i<xmlDoc.getElementsByTagName("ellipse").length;i++){
				var type= xmlDoc.getElementsByTagName("ellipse")[i];
				var cx= type.getAttribute('cx');
				var cy= type.getAttribute('cy');
				var rx= type.getAttribute('rx');
				var ry= type.getAttribute('ry');
				var strokeColor= type.getAttribute('stroke');
				var strokeWidth= parseInt(type.getAttribute('stroke-width'));
				
				svgEllipse1[ellipse1][0]= parseInt(cx);
				svgEllipse1[ellipse1][1]= parseInt(cy);
				svgEllipse1[ellipse1][2]= parseInt(rx);
				svgEllipse1[ellipse1][3]= parseInt(ry);
				svgEllipse1[ellipse1][4]= strokeColor;
				svgEllipse1[ellipse1][5]= strokeWidth;
				ellipse1++;
			}
			
			for(var i= 0; i<xmlDoc.getElementsByTagName("rect").length;i++){
				var type= xmlDoc.getElementsByTagName("rect")[i];
				var x= parseInt(type.getAttribute('x'));
				var y= parseInt(type.getAttribute('y'));
				var w= parseInt(type.getAttribute('width'));
				var h= parseInt(type.getAttribute('height'));
				var strokeColor= type.getAttribute('stroke');
				var strokeWidth= parseInt(type.getAttribute('stroke-width'));
				
				svgRect1[rect1][0]= x;
				svgRect1[rect1][1]= y;
				svgRect1[rect1][2]= x+w;
				svgRect1[rect1][3]= y+h;
				svgRect1[rect1][4]= strokeColor;
				svgRect1[rect1][5]= strokeWidth;
				rect1++;
			}
			var xmlText = new XMLSerializer().serializeToString(xmlDoc);	
		}
		getDCM();
	}
//END GET FHIR VALUE