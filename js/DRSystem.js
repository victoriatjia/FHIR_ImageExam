var patientObservation, findingObservation;
var previousRow, previousRow2, rowmaxNum = 20;
var findingCount = 0;;
var DrawdcmAnnotationID = [], Annotationcount = 0;

function jsFunction(value) {
    var valueBox = document.getElementById("valueBox");
    clearDiv(valueBox);
    var input = document.createElement("input");
    input.id = "textValue";
    valueBox.appendChild(input);
}
function clearDiv(elementID) {
    elementID.innerHTML = "";
}
function searchPatient() {
    clearDiv(document.getElementById("contactBox"));
    clearDiv(document.getElementById("listPatient"));
    clearDiv(document.getElementById("findingBox"));
    var conditionValue = '';
    var condition = document.getElementById("conditionPatient").value;
    conditionValue = document.getElementById("textValue").value;
    if (conditionValue == "" || conditionValue == " ") {
        alert("Please fill the input text!");
    }
    else {
        var strUrl;
        switch (condition) {
            case "Patient ID":
                strUrl = fhir.url + "DiagnosticReport?subject=TCUMI106." + conditionValue;
                break;
        }
        getJSON(strUrl, 0, "Patient", null, null, null);
    }
}
function getJSON(strUrl, firstrowNum, type, tableTarget, fromDR, typexxpt) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', strUrl, true);//https://orthanc.dicom.tw/dicom-web/studies/1.3.6.1.4.1.14519.5.2.1.9999.103.2445110399502685110179049624124
    //xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader("Content-type", 'application/json');
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) // && this.status == 201) 
        {
            var res = JSON.parse(this.responseText);
            if (type == "Patient") patientObservation = res;
            else if (type == "Finding") { findingObservation = res; findingCount++; }

            if (res != undefined && res.resourceType == "OperationOutcome") {
                var errStr = "";
                for (var i = 0; i < res.issue.length; i++) {
                    errStr += res.issue[i].diagnostics + '<br>';
                }
                alert(errStr);
            }
            else if (res.resourceType == "Bundle" && res.total == 0) alert("Data is not exist!");
            else {
                setTablePatient(res, firstrowNum, type, tableTarget, findingCount, fromDR, typexxpt);
            }
        }
    }
    xhr.send();
}
function setTablePatient(patientObservation, firstrowNum, type, tableTarget, findingCount, fromDR, typexxpt) {
    if (type == "Patient") {
        clearDiv(document.getElementById("contactBox"));
        clearDiv(document.getElementById("listPatient"));
        clearDiv(document.getElementById("findingBox"));
        var condition = document.getElementById("conditionPatient").value;
        var table = document.createElement("table");
        table.id = "tablePatient";
        table.style.border = "3px solid #000"
        var bundle;
        if (patientObservation.entry != undefined) {
            bundle = patientObservation;
            patientObservation = patientObservation.entry[0].resource;
        }
        var cellText = ["No", "Diagnostic Report Id", "Encounter", "Practitioner", "Last Updated"];
        setfirstRow(table, cellText);
        if (bundle != undefined) {
            for (var i = 0; i < bundle.entry.length; i++) {
                displayIdentifier(table, bundle.entry[i].resource, firstrowNum);
            }
            if (bundle.link != undefined && bundle.link.length > 1) {
                var row = document.createElement("tr");
                var btnNext, btnPrev;
                for (var i = 0; i < bundle.link.length; i++) {
                    if (bundle.link[i].relation == "next") {
                        btnNext = document.createElement("BUTTON");
                        btnNext.innerHTML = "next";
                        btnNext.value = bundle.link[i].url;
                        btnNext.onclick = function () { getJSON(this.value, firstrowNum + rowmaxNum, null, table, null, null); };
                    }
                    if (bundle.link[i].relation == "previous") {
                        btnPrev = document.createElement("BUTTON");
                        btnPrev.innerHTML = "previous";
                        btnPrev.value = bundle.link[i].url;
                        btnPrev.onclick = function () { getJSON(this.value, firstrowNum - rowmaxNum, null, table, null, null); };
                    }
                }
                if (btnPrev != undefined) row.appendChild(btnPrev);
                if (btnNext != undefined) row.appendChild(btnNext);
                table.appendChild(row);
            }
        }
        else
            displayIdentifier(table, patientObservation, firstrowNum);

        document.getElementById("listPatient").appendChild(table);
    }
    if (type == "Finding") {

        clearDiv(document.getElementById("findingBox"));

        var singlePatient = (patientObservation.entry == undefined) ? patientObservation : patientObservation.entry[id - 1].resource;
        var componentRow = [], componentCount = 0;
        for (var i = 0; i < singlePatient.component.length; i++) {
            for (var j = 0; j < singlePatient.component[i].code.coding.length; j++) {

                row2 = document.createElement("tr");
                cell = document.createElement("td");
                row2.className = "noBorder";
                var str = singlePatient.component[i].code.coding[j].system.split("/");

                str = str[str.length - 1].split(".html");
                cell.innerHTML = String.fromCharCode(97 + i) + ". " + str[0] + ":";
                row2.appendChild(cell);

                cell = document.createElement("td");
                var divStr = "<a target='_blank' href='" + singlePatient.component[i].code.coding[j].system + "'>" + singlePatient.component[i].code.coding[j].display;
                cell.innerHTML = divStr;
                row2.appendChild(cell);

                componentRow.push(row2);
                componentCount++;
            }
        }
        var gname = ["<b>Finding Type</b>", "Annotation"];
        var gvalue = [];
        var FindingTypeValue = "", AnnotationValue = "";
        for (var i = 0; i < singlePatient.identifier.length; i++) {
            if (i != 0) FindingTypeValue += ',<br>';
            FindingTypeValue += singlePatient.identifier[i].value;
        }
        for (var i = 0; i < singlePatient.derivedFrom.length; i++) {
            if (i != 0) AnnotationValue += ',<br>';
            var str = singlePatient.derivedFrom[i].reference.split("/");
            AnnotationValue += "<a target='_blank' href='systemA.html?AnnotationID=" + str[str.length - 1] + "'>" + str[str.length - 1];
            if (fromDR = "DR") { DrawdcmAnnotationID.push(str[str.length - 1]); Annotationcount++; }
            //getFHIREdu(str[str.length - 1], 'stuAnswer');
        }
        gvalue.push(FindingTypeValue);
        gvalue.push(AnnotationValue);
        for (var i = 0; i < gname.length; i++) {
            row2 = document.createElement("tr");
            if (i == 0) {
                cell = document.createElement("td");
                var num = 1 + gname.length + componentCount;
                cell.rowSpan = num;
                cell.innerHTML = findingCount + ".";
                row2.appendChild(cell);
            }
            cell = document.createElement("td");
            row2.className = "noBorder";
            cell.innerHTML = gname[i] + ":";
            row2.appendChild(cell);

            cell = document.createElement("td");
            cell.innerHTML = gvalue[i];
            row2.appendChild(cell);
            tableTarget.appendChild(row2);
        }

        row2 = document.createElement("tr");
        cell = document.createElement("td");
        cell.colSpan = "2";
        cell.innerHTML = "Finding Component";
        row2.appendChild(cell);
        tableTarget.appendChild(row2);

        for (var i = 0; i < componentCount; i++) {
            tableTarget.appendChild(componentRow[i]);
        }
        if (DRObservation != undefined && fromDR == "DR") {
            if (Annotationcount == DRObservation.result.length) {
                if (typexxpt == "stuAnswer") { getFHIREdu(DrawdcmAnnotationID[0], 'stuAnswer'); }
                else {
                    for (var i = 0; i < DrawdcmAnnotationID.length; i++) {
                        getFHIREdu(DrawdcmAnnotationID[i], typexxpt);
                    }
                }
            }
        }
    }
}
function setfirstRow(table, cellText) {
    var row = document.createElement("tr");
    for (var i = 0; i < cellText.length; i++) {
        var cell = document.createElement("th");
        cell.style.backgroundColor = '#e6e6e6';
        cell.innerHTML = cellText[i];
        row.appendChild(cell);
    }
    table.appendChild(row);
}
function displayIdentifier(table, patientObservation, firstrowNum) {
    var condition = document.getElementById("conditionPatient").value;
    var row = document.createElement("tr");
    var cell0 = document.createElement("td");
    cell0.innerHTML = (firstrowNum + table.rows.length);
    row.appendChild(cell0);

    cell0 = document.createElement("td");
    cell0.innerHTML = patientObservation.id;
    row.appendChild(cell0);
    var gvalue = [patientObservation.encounter.reference];
    for (var i = 0; i < gvalue.length; i++) {
        var cell = document.createElement("td");
        var strValue = gvalue[i].split("/");
        cell.innerHTML = strValue[1];
        row.appendChild(cell);
    }
    cell = document.createElement("td");
    cell.innerHTML = "";
    for (var i = 0; i < patientObservation.resultsInterpreter.length; i++) {
        if (i != 0) cell1.innerHTML += ',<br>';
        var practstr = patientObservation.resultsInterpreter[i].reference.split("/");
        cell.innerHTML += practstr[1];
    }
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.innerHTML = patientObservation.meta.lastUpdated;
    row.appendChild(cell);


    row.onclick = createClickHandler2(row, firstrowNum);

    table.appendChild(row);
}
var createClickHandler2 = function (row, firstrowNum) {
    return function () {
        findingCount = 0;
        clearDiv(document.getElementById("findingBox"));
        var cell = row.getElementsByTagName("td")[0];
        var id = cell.innerHTML - firstrowNum;

        if (previousRow != undefined) previousRow.style.backgroundColor = 'white';
        row.style.backgroundColor = '#cccccc';
        previousRow = row;

        var contactBox = document.getElementById("contactBox");
        clearDiv(contactBox);

        var singlePatient = (patientObservation.entry == undefined) ? patientObservation : patientObservation.entry[id - 1].resource;

        var table = document.createElement("table");
        contactBox.appendChild(table);
        table.id = "tablegeneralDR";

        var row2 = document.createElement("tr");
        var cell = document.createElement("th");
        cell.colSpan = "3";
        cell.style.textAlign = "center";
        cell.innerHTML = "Diagnostic Report";
        row2.appendChild(cell);
        table.appendChild(row2);

        var gname = ["ID", "Patient", "Encounter", "Practitioner", "Last updated"];
        var gvalue = [singlePatient.id, singlePatient.subject.reference, singlePatient.encounter.reference];
        var PractitionerValue = "";
        for (var i = 0; i < singlePatient.resultsInterpreter.length; i++) {
            if (i != 0) PractitionerValue += ',<br>';
            var practstr = singlePatient.resultsInterpreter[i].reference.split("/");
            PractitionerValue += practstr[1];
        }
        for (var i = 1; i < gvalue.length; i++) {
            var strValue = gvalue[i].split("/");
            gvalue[i] = strValue[1];
        }
        gvalue.push(PractitionerValue);
        gvalue.push(singlePatient.meta.lastUpdated);
        for (var i = 0; i < gname.length; i++) {
            row2 = document.createElement("tr");
            cell = document.createElement("td");
            row2.className = "noBorder";
            cell.innerHTML = gname[i] + ":";
            row2.appendChild(cell);

            cell = document.createElement("td");
            cell.innerHTML = gvalue[i];
            row2.appendChild(cell);
            table.appendChild(row2);
        }
        row2 = document.createElement("tr");
        cell = document.createElement("th");
        cell.innerHTML = "Imaging Study <h style='font-size:16px'>(Click below id to view the imaging study)</h>";
        cell.colSpan = "3";
        cell.style.fontSize = "20px";
        row2.appendChild(cell);
        table.appendChild(row2);

        //var ImagingStudyValue = "";
        for (var i = 0; i < singlePatient.imagingStudy.length; i++) {
            row2 = document.createElement("tr");
            cell = document.createElement("td");
            row2.className = "noBorder";
            cell.colSpan = "3";
            var ImagingStudyValue = singlePatient.imagingStudy[i].reference.split("/");
            cell.innerHTML = String.fromCharCode(97 + i) + ". <u>" + ImagingStudyValue[1] + "</u>";
            row2.appendChild(cell);
            row2.onclick = createClickImagingStudy(ImagingStudyValue[1]);
            table.appendChild(row2);
        }

        row2 = document.createElement("tr");
        cell = document.createElement("th");
        cell.innerHTML = "Conclusion";
        cell.colSpan = "3";
        cell.style.fontSize = "20px";
        row2.appendChild(cell);
        table.appendChild(row2);

        //        var ResultValue = "";
        for (var i = 0; i < singlePatient.conclusionCode[0].coding.length; i++) {
            row2 = document.createElement("tr");
            cell = document.createElement("td");
            row2.className = "noBorder";
            cell.colSpan = "3";
            cell.innerHTML = String.fromCharCode(97 + i) + ". " + singlePatient.conclusionCode[0].coding[i].display;
            row2.appendChild(cell);
            table.appendChild(row2);
        }

        row2 = document.createElement("tr");
        cell = document.createElement("th");
        cell.innerHTML = "<u>Findings </u>";
        cell.colSpan = "3";
        cell.style.fontSize = "20px";
        row2.appendChild(cell);
        table.appendChild(row2);

        var ResultValue = "";
        for (var i = 0; i < singlePatient.result.length; i++) {
            strUrl = fhir.url + singlePatient.result[i].reference;
            getJSON(strUrl, 0, "Finding", table, null, null);
        }
    };
};

var createClickImagingStudy = function (imagingStudyID) {
    return function () {
        var id = imagingStudyID;
        sessionStorage.setItem('imagingStudyID', imagingStudyID);
        window.open("image-query.html", '_blank');
    };
};
