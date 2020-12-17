var getJSON = function (url, last, dataShowed, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            callback(xhr.response, last, dataShowed);
        }
    };
    xhr.send();
};

var getDICOM = function (url, callback) {
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
};

function clearTable(col1, col2) {
    var header_row = document.getElementById("tablelist").rows[0];
    header_row.cells[1].innerHTML = col1;
    header_row.cells[2].innerHTML = col2;
    document.getElementById("tablelist").getElementsByTagName("tbody")[0].innerHTML = "";
}

function getImage() {
    //var url = "https://oauth.dicom.org.tw/orthanc/dicom-web/studies/1.3.6.1.4.1.14519.5.2.1.9999.103.2445110399502685110179049624130/series/1.3.6.1.4.1.14519.5.2.1.9999.103.2226892066207840840424092100052/instances/1.3.6.1.4.1.14519.5.2.1.9999.103.3006616233530892121079169089013"
    var url = DICOMrootURL + "/dicom-web/studies/1.3.6.1.4.1.14519.5.2.1.5099.8010.256809878238026661650178294515/series/1.3.6.1.4.1.14519.5.2.1.5099.8010.293653169363509354643731389289/instances/1.3.6.1.4.1.14519.5.2.1.5099.8010.771104110219016637590309730419";
    //var url = "http://startup.dicom.org.tw/wado?requestType=WADO&contentType=application/dicom&studyUID=1.2.276.0.7230010.3.1.2.367779275.15096.1597913898.329&seriesUID=1.2.276.0.7230010.3.1.3.367779275.15096.1597913898.330&objectUID=1.2.276.0.7230010.3.1.4.367779275.9892.1597913899.525";
    //var url = "https://orthanc.dicom.tw/wado?requestType=WADO&studyUID=1.3.6.1.4.1.14519.5.2.1.5099.8010.256809878238026661650178294515&seriesUID=1.3.6.1.4.1.14519.5.2.1.5099.8010.293653169363509354643731389289&objectUID=1.3.6.1.4.1.14519.5.2.1.5099.8010.771104110219016637590309730419";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            var dicom = xhr.response;
            var byteArray = new Uint8Array(dicom);
            alert(byteArray);
        }
    };
    xhr.send();
}

function getPatientList() {
    clearTable("Patient UID", "Patient UID");
    getJSON(DICOMrootURL + '/patients/', null, null, function (data, last, dataShowed) { //https://mtss.dicom.tw/api/fhir/ImagingStudy/

        var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];

        for (var i = 0; i < data.length; i++) {
            getJSON(FHIRrootURL + '/TCUMI106.' + data[i], null, null, function (data2, last, dataShowed) { //https://mtss.dicom.tw/api/fhir/ImagingStudy/

                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);

                var rows = table.getElementsByTagName("tr");
                cell1.innerHTML = rows.length - 1;
                cell2.innerHTML = data[rows.length - 2];
                cell3.innerHTML = data2.MainDicomTags.PatientID;
            });
        }
    });
}

function getImagingStudyList() {
    clearTable("Study ID", "Preview");
    var pID = document.getElementById("PatientID").value;
    getJSON(DICOMrootURL + '/dicom-web/studies/?&PatientID=' + pID, null, null, function (data, last, dataShowed) {
        drawtablelist(null, null, 0, data, "Study");
    });
}

function getSeries(studyID) {
    clearTable("Series UID", "Preview");
    var url = DICOMrootURL + '/dicom-web/studies/' + studyID + '/series';
    getJSON(url, null, null, function (data, last, dataShowed) {
        drawtablelist(studyID, null, 0, data, "Series");
    });
}

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
    if (first >= 0 && first < data.length) {
        clearTable(dataType + " UID", "Preview");
        var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
        if (first + 10 > data.length) {
            last = data.length;
        } else {
            last = first + 10;
        }
        setcontentNavbar(studyID, seriesID, first, data, dataType);
        for (var j = first; j < last; j++) {
            if (dataType == "Instance") {
                drawInnertable(downloadFile, data[j], studyID, seriesID, first, last, data, dataType);
            }
            else if (dataType == "Study") {
                var url = DICOMrootURL + '/dicom-web/studies/' + data[j]["0020000D"].Value[0] + '/series/';
                getJSON(url, last, data, function (data2, last, dataShowed) {
                    var url2 = DICOMrootURL + '/dicom-web/studies/' + data2[0]["0020000D"].Value[0] + '/series/' + data2[0]["0020000E"].Value[0] + '/instances';
                    getJSON(url2, last, dataShowed, function (data3, last, dataShowed) {
                        drawInnertable(getSeries, data3, studyID, seriesID, first, last, dataShowed, dataType);
                    });
                });
            }
            else if (dataType == "Series") {
                var url = DICOMrootURL + '/dicom-web/studies/' + data[j]["0020000D"].Value[0] + '/series/' + data[j]["0020000E"].Value[0] + '/instances/';
                getJSON(url, last, data, function (data2, last, dataShowed) {
                    drawInnertable(getInstances, data2, studyID, seriesID, first, last, dataShowed, dataType);
                });
            }
        }
    }
}

function populateInstancesList(studyID, seriesID, first, data) {
    if (first >= 0 && first < data.length) {
        if (first + 10 > data.length) {
            last = data.length;
        }
        else {
            last = first + 10;
        }

        var dcmFiles=[];

        for (var j = first; j < last; j++) {
            //drawInnertable(downloadFile, data[j], studyID, seriesID, first, last, data, dataType);
            var instance = data[j];
            var list = document.getElementById("instancesList");
            var li = document.createElement('li');
            //li.innerHTML=instance["00080018"].Value[0];

            var studyID = sessionStorage.getItem('studyUID');
            var seriesID = sessionStorage.getItem('seriesUID');
            var img = document.createElement('img');
            img.width = 100;
            img.height = 100;
            img.src = DICOMrootURL + "/wado/?requestType=WADO&contentType=image/jpeg&studyUID=" + studyID + "&seriesUID=" + seriesID + "&objectUID=" + instance["00080018"].Value[0];
            //li.onclick="setDCM("+ j+")";
            li.value=j;
            li.onclick = function() {
                var v = this.value;
                //alert(dcmFiles[v]);
            //    var url = DICOMrootURL + "/wado/?requestType=WADO&contentType=application/dicom&studyUID=" + studyID + "&seriesUID=" + seriesID + "&objectUID=" + dcmFiles[v];
            //var url = DICOMrootURL + "/orthanc/dicom-web/studies/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.4.0/series/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.5.0/instances/1.3.6.1.4.1.5962.99.1.392793638.85272995.1542286085670.3.0";
            var url = DICOMrootURL + "/dicom-web/studies/"+ studyID +"/series/" + seriesID + "/instances/" + dcmFiles[v];

                sessionStorage.setItem('index', url);
                dcmFile = url;
                getDCM("A");
            };

            dcmFiles.push(instance["00080018"].Value[0]);
            
            li.appendChild(img);
            list.appendChild(li);
        }
        return dcmFiles;
    }
}

function drawInnertable(callback, data, studyID, seriesID, first, last, dataShowed, dataType) {
    var datavalue;
    var table = document.getElementById("tablelist").getElementsByTagName("tbody")[0];
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var createClickHandler = function (row, fileType) {
        return function () {
            var cell = row.getElementsByTagName("td")[1];
            var id = cell.innerHTML;
            if (dataType == "Study")
                callback(data[0]["0020000D"].Value[0]);
            else if (dataType == "Series")
                callback(data[0]["0020000D"].Value[0], data[0]["0020000E"].Value[0]);
            else if (dataType == "Instance")
                callback(data["0020000D"].Value[0], data["0020000E"].Value[0], data["00080018"].Value[0], fileType);
        };
    };

    var IDValue = '';
    if (dataType == "Study") {
        datavalue = data[0];
        IDValue = data[0]["0020000D"].Value[0];
        row.onclick = createClickHandler(row, null);
    }
    else if (dataType == "Series") {
        datavalue = data[0];
        IDValue = data[0]["0020000E"].Value[0];
        row.onclick = createClickHandler(row, null);
    }
    else if (dataType == "Instance") {
        datavalue = data;
        IDValue = data["00080018"].Value[0];
        var btn0 = document.createElement('input');
        btn0.type = "button";
        btn0.value = "Download JSON";
        btn0.onclick = createClickHandler(row, "json");
        var btn1 = document.createElement('input');
        btn1.type = "button";
        btn1.value = "Download Dicom";
        btn1.onclick = createClickHandler(row, "download");
        var btn2 = document.createElement('input');
        btn2.type = "button";
        btn2.value = "View Dicom";
        btn2.onclick = createClickHandler(row, "view");

        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        cell4.appendChild(btn0);
        cell5.appendChild(btn1);
        cell6.appendChild(btn2);

    }

    var img = document.createElement('img');
    img.width = 100;
    img.height = 100;
    img.src = DICOMrootURL + "/wado/?requestType=WADO&contentType=image/jpeg&studyUID=" + datavalue["0020000D"].Value[0] + "&seriesUID=" + datavalue["0020000E"].Value[0] + "&objectUID=" + datavalue["00080018"].Value[0];
    img.alt = "Preview Not Available"
    var rows = table.getElementsByTagName("tr");
    cell1.innerHTML = first + rows.length - 1;
    cell2.innerHTML = IDValue;
    cell3.appendChild(img);

    var limit = (last % 10 == 0) ? 10 : (last % 10);
    if (table.rows.length == limit + 1) {
        var row2 = table.insertRow(-1);
        var cell21 = row2.insertCell(0);
        var cell22 = row2.insertCell(1);

        var btn3 = document.createElement('input');
        btn3.type = "button";
        btn3.value = "next";
        btn3.onclick = function () { drawtablelist(studyID, seriesID, (first + 10), dataShowed, dataType) };
        var btn4 = document.createElement('input');
        btn4.type = "button";
        btn4.value = "prev";
        btn4.onclick = function () { drawtablelist(studyID, seriesID, (first - 10), dataShowed, dataType) };
        cell21.appendChild(btn4);
        cell22.appendChild(btn3);
    }
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

function downloadFile(studyID, seriesID, instanceID, fileType) {
    var url;
    if (fileType == "download") {
        url = DICOMrootURL + "/dicom-web/studies/" + studyID + "/series/" + seriesID + "/instances/" + instanceID;
        getDICOM(url, function (data) {
            // var element = document.getElementById('dicomImage');
            // cornerstone.enable(element);
            // cornerstone.loadImage(data).then(function (image) {
            //     cornerstone.displayImage(element, image);
            // });
        });
    }
    else if (fileType == "json") {
        url = DICOMrootURL + '/dicom-web/studies/' + studyID + '/series/' + seriesID + '/instances/?&SOPInstanceUID=' + instanceID;
    }
    else if (fileType == "view") {
        var param = "https://orthanc.dicom.tw/dicom-web/studies/" + studyID + "/series/" + seriesID + "/instances/" + instanceID;
        //var param = DICOMrootURL + "/wado/?requestType=WADO&contentType=application/dicom&studyUID=" + studyID + "&seriesUID=" + seriesID + "&objectUID=" + instanceID;
        param = btoa(param);
        param = encodeURI(param)
        url = "systemA.html?image=" + param;
    }
    window.open(url, '_blank');
}