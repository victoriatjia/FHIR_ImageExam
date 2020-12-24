init();

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            callback(xhr.response);
        }
    };
    xhr.send();
}

function getDICOM(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    //xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.responseType = 'application/dicom';

    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            callback(xhr.response);
        }
    };
    xhr.send();
}

function init() {
    var fhirID = sessionStorage.getItem('imagingStudyID');
    if (fhirID != undefined) {
        var url = FHIRrootURL + '/ImagingStudy/' + fhirID;
        getJSON(url, null, null, function (data) {
            drawtablelist(null, null, 0, data, "Series");

        });
    }
}

function clearTable(headerContent, tableTarget) {
    var header_row = tableTarget.rows[0];
    for (var i = 0; i < headerContent.length; i++) {
        header_row.cells[i].innerHTML = headerContent[i];
    }
    tableTarget.getElementsByTagName("tbody")[0].innerHTML = "";
    document.body.scrollTop = 200; // For Safari
    document.documentElement.scrollTop = 200; // For Chrome, Firefox, IE and Opera
}

function getPatientList() {
    var header = ["No", "Patient UID", "Patient Name"];
    var tableTarget = document.getElementById("tablelist")
    clearTable(header, tableTarget);
    var pID = document.getElementById("PatientID").value.trim();

    if (pID != "") {

        getJSON(FHIRrootURL + '/Patient/TCUMI106.' + pID, function (data2) {
            var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
            var row = table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            var rows = table.getElementsByTagName("tr");
            cell1.innerHTML = rows.length;

            if (data2.identifier == null) {
                var id = data2.id.split('.');
                cell2.innerHTML = id[1];//
            }
            else {
                cell2.innerHTML = data2.identifier[0].value;//data2.id;//
            }
            if (data2.name == null) {
                var id = data2.id.split('.');
                cell3.innerHTML = id[1];//
            } else {
                cell3.innerHTML = data2.name[0].text;
            }

        });

    }
    else {
        getJSON(DICOMrootURL + '/patients/', function (data) { //https://mtss.dicom.tw/api/fhir/ImagingStudy/

            for (var i = 0; i < data.length; i++) {
                getJSON(DICOMrootURL + '/patients/' + data[i], function (orthancPatient) {
                    var patientID = "TCUMI106." + orthancPatient.MainDicomTags.PatientID;
                    var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
                    getJSON(FHIRrootURL + '/Patient/' + patientID, function (data2) { //https://mtss.dicom.tw/api/fhir/ImagingStudy/

                        var row = table.insertRow(-1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);

                        var rows = table.getElementsByTagName("tr");
                        cell1.innerHTML = rows.length;
                        if (data2.identifier == null) {
                            var id = data2.id.split('.');
                            cell2.innerHTML = id[1];//
                        }
                        else {
                            cell2.innerHTML = data2.identifier[0].value;//data2.id;//
                        }
                        if (data2.name == null) {
                            var id = data2.id.split('.');
                            cell3.innerHTML = id[1];//
                        } else {
                            cell3.innerHTML = data2.name[0].text;
                        }

                    });




                });
            }
        });
    }
}

function getImagingStudyList() {
    var header = ["No", "Study Description", "Preview"];
    var tableTarget = document.getElementById("tablelist")
    clearTable(header, tableTarget);
    var url = FHIRrootURL + '/ImagingStudy/';

    var pID = document.getElementById("PatientID").value.trim();
    if (pID != "") {
        url += '?subject=TCUMI106.' + pID
    }


    //var url = DICOMrootURL + '/dicom-web/studies/?&PatientID=' + pID;
    getJSON(url, function (data) {
        drawtablelist(null, null, 0, data, "Study");

    });
}

// function getSeries(studyID) {
//     var header = ["No", "Series Description", "Preview"];
//     var tableTarget = document.getElementById("tablelist")
//     clearTable(header, tableTarget);
//     var url = DICOMrootURL + '/dicom-web/studies/' + studyID + '/series';
//     getJSON(url, null, null, function (data, last, dataShowed) {
//         drawtablelist(studyID, null, 0, data, "Series");
//     });
// }

function getInstances(studyID, seriesID) {
    //https://orthanc.dicom.tw/wado/?requestType=WADO&contentType=image/jpeg&studyUID=1.2.840.113674.1118.54.200&seriesUID=1.2.840.113674.1118.54.179.300&objectUID=1.2.840.113674.950809132635041.100

    //awalnya list di table skrng gnti jadi session ke system A
    /* var url = 'https://orthanc.dicom.tw/dicom-web/studies/' + studyID + '/series/' + seriesID + '/instances/';
    getJSON(url, null, null, function (data, last, dataShowed) {
        drawtablelist(studyID, seriesID, 0, data, "Instance");
    }); */
    sessionStorage.setItem('studyUID', studyID);
    sessionStorage.setItem('seriesUID', seriesID);
    var url = "systemA.html";
    window.open(url, '_blank');

}

function drawtablelist(studyID, seriesID, first, data, dataType) {
    var header = ["No", dataType + " Description", "Preview"];
    var tableTarget = document.getElementById("tablelist")
    clearTable(header, tableTarget);
    setcontentNavbar(studyID, seriesID, first, data, dataType);

    var dataAry;
    switch (dataType) {
        case 'Study':
            dataAry = data.entry;
            break;
        case 'Series':
            dataAry = data.series;
            arr = data.identifier[0].value.split(':');
            studyID = arr[2];
            break;
        default:
            callback = null;
            break;
    }

    for (var j = first; j < dataAry.length; j++) {

        if (dataType != "Study" || dataAry[j].resource.series[0].modality.code != "SR") {

            // var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
            // var row = table.insertRow(-1);
            // var cell = row.insertCell(0);
            // cell.colSpan=3;
            // cell.innerHTML="Not an Image"
            drawInnertable(dataAry[j], studyID, seriesID, first, dataType);
        } else {


        }


    }

}

function drawInnertable(data, studyID, seriesID, first, dataType) {
    var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var createClickHandler = function () {
        return function () {
            if (dataType == "Study") {
                drawtablelist(0, 0, 0, data.resource, "Series");
            } else if (dataType == "Series") {
                studyNum = studyID;
                seriesNum = data.uid;
                getInstances(studyNum, seriesNum);
            } else if (dataType == "Instance") {
                studyNum = studyID;
                seriesNum = data.uid;
                getInstances(studyNum, seriesNum);
            }
        };
    };

    var studyNum = 0,
        seriesNum = 0,
        instanceNum = 0;

    var description = '';
    if (dataType == "Study") {
        resource = data.resource;
        arr = resource.identifier[0].value.split(':');
        studyNum = arr[2];
        seriesNum = resource.series[0].uid;
        instanceNum = resource.series[0].instance[0].uid;
        description += "StudyUID: " + studyNum + "<br>";
        description += "Started Date: " + resource.started + "<br>";
        var patientStr = resource.subject.reference.split('/');
        description += "Patient ID: " + patientStr[1] + "<br>";
        description += "Number of series: " + resource.numberOfSeries + "<br>";
        description += "Number of instances: " + resource.numberOfInstances + "<br>";
        row.onclick = createClickHandler(row, null);
    } else if (dataType == "Series") {
        studyNum = studyID;
        seriesNum = data.uid;
        instanceNum = data.instance[0].uid;
        description += "StudyUID: " + studyNum + "<br>";
        description += "SeriesUID: " + seriesNum + "<br>";

        if (data.number != null);
        description += "Series Number: " + data.number + "<br>";
        if (data.modality != null)
            description += "Modality: " + data.modality.code + "<br>";
        if (data.bodySite != null)
            description += "Body Site: " + data.bodySite.display + "<br>";
        if (data.numberOfInstances != null)
            description += "Number of instances: " + data.numberOfInstances + "<br>";

        row.onclick = createClickHandler(row, null);
    }

    var img = document.createElement('img');
    img.width = 100;
    img.height = 100;
    img.src = DICOMrootURL + "/wado/?requestType=WADO&contentType=image/jpeg&studyUID=" + studyNum + "&seriesUID=" + seriesNum + "&objectUID=" + instanceNum;
    img.alt = "Preview Not Available"
    var rows = table.getElementsByTagName("tr");
    cell1.innerHTML = first + rows.length;
    cell2.innerHTML = description;
    cell3.appendChild(img);

    // var limit = (last % 10 == 0) ? 10 : (last % 10);
    // if (table.rows.length == limit + 1) {
    //     var row2 = table.insertRow(-1);
    //     var cell21 = row2.insertCell(0);
    //     var cell22 = row2.insertCell(1);

    //     var btn3 = document.createElement('input');
    //     btn3.type = "button";
    //     btn3.value = "next";
    //     btn3.onclick = function () { drawtablelist(studyID, seriesID, (first + 10), dataShowed, dataType) };
    //     var btn4 = document.createElement('input');
    //     btn4.type = "button";
    //     btn4.value = "prev";
    //     btn4.onclick = function () { drawtablelist(studyID, seriesID, (first - 10), dataShowed, dataType) };
    //     cell21.appendChild(btn4);
    //     cell22.appendChild(btn3);
    // }
}

function setcontentNavbar(studyID, seriesID, first, data, dataType) {

    if (dataType == "Study") {
        cleardiv();
        var divNavbar = document.getElementById("contentBar");
        var temp_link = document.createElement("a");
        temp_link.href = "#";
        temp_link.innerHTML = "Study";

        var par = document.createElement("p");
        par.innerHTML = "> ";
        par.appendChild(temp_link);

        divNavbar.appendChild(par);
        temp_link.addEventListener("click", e => {
            drawtablelist(studyID, seriesID, first, data, dataType);
        });
    }
}

function cleardiv() {
    var div = document.getElementById('contentBar');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}


function populateInstancesList(studyID, seriesID, first, data) {
    if (first >= 0 && first < data.length) {
        if (first + 10 > data.length) {
            last = data.length;
        } else {
            last = first + 10;
        }

        var dcmFiles = [];

        for (var j = first; j < last; j++) {
            var instance = data[j];
            var list = document.getElementById("instancesList");
            var li = document.createElement('li');

            var studyID = sessionStorage.getItem('studyUID');
            var seriesID = sessionStorage.getItem('seriesUID');
            var img = document.createElement('img');
            img.width = 100;
            img.height = 100;
            img.src = DICOMrootURL + "/wado/?requestType=WADO&contentType=image/jpeg&studyUID=" + studyID + "&seriesUID=" + seriesID + "&objectUID=" + instance["00080018"].Value[0];
            //li.onclick="setDCM("+ j+")";
            li.value = j;
            li.onclick = function () {
                var v = this.value;
                //alert(dcmFiles[v]);
                //    var url = DICOMrootURL + "/wado/?requestType=WADO&contentType=application/dicom&studyUID=" + studyID + "&seriesUID=" + seriesID + "&objectUID=" + dcmFiles[v];
                //var url = DICOMrootURL + "/orthanc/dicom-web/studies/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.4.0/series/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.5.0/instances/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.3.0";
                var url = DICOMrootURL + "/dicom-web/studies/" + studyID + "/series/" + seriesID + "/instances/" + dcmFiles[v];

                sessionStorage.setItem('index', url);
                dcmFile = url;
                getDCM("A");

                getJSON(FHIRrootURL + '/ImagingStudy?identifier=urn:oid:' + studyID, function (data2) { //https://mtss.dicom.tw/api/fhir/ImagingStudy/

                    patientStudy_ID = data2.entry[0].resource.subject.reference.split("/");
                    patientStudy_ID = patientStudy_ID[1];
                    ImagingStudy_ID = data2.entry[0].resource.id;

                    modality = data2.entry[0].resource.series[0].modality.code;

                });

                var header = ["Type Annotation", "SVG Annotation", "Post Annotation", "Finding Type", "Finding ID"];
                var tableTarget = document.getElementById("myTable")
                clearTable(header, tableTarget);
            };

            dcmFiles.push(instance["00080018"].Value[0]);

            li.appendChild(img);
            list.appendChild(li);
        }
        return dcmFiles;
    }
}