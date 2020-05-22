"use strict";

const actuatorRoot = "../actuator";
const actuatorSelector = document.getElementById('actuatorSelector');
const varArea = document.getElementById('varArea');
const varInput = document.getElementById('varInput');
const varDataList = document.getElementById('varDataList');
const contentFrame = document.getElementById('content');

var varListData = null;
var envPropData = null;
var metricsData = null;
var varValidList = [];

function initActuators(actuators) {
    let text = '';
    let links = actuators._links;
    let selectedOption = null;
    function containsToken(string, list) {
        return new RegExp(list.join('|')).test(string)
    }

    const defaults = ['health', 'info', 'env'];
    const excluded = ['caches', 'heapdump', "self", "shutdown"];
    let defaultOption = false;
    Object.keys(links).sort().forEach(function(key) {
        const actuator = links[key];
        if(! containsToken(key, excluded)) {
            const label = key.replace('-', ': ');
            let option = new Option(label, actuator.href);
            option.label = label;
            if(!defaultOption && containsToken(label, defaults)) {
                defaultOption = option;
            }
            actuatorSelector.appendChild(option);
        }
    });
    console.log(text);
    actuatorSelector.value = defaultOption.value;
    actuatorChanged();
}

function setEnvPropsDataList() {
    const data = envPropData;
    const propertiesList = JSONPath.JSONPath({path: '$..properties', json: data});
    let propertyNames = [];
    for(var properties in propertiesList) {
        const keys = JSONPath.JSONPath({path: '$.*~', json: propertiesList[properties]});
        propertyNames = propertyNames.concat(keys);
    }
    propertyNames.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    console.log(propertyNames);
    varDataList.innerHTML = '';
    propertyNames.forEach(function (item, index) {
      console.log(item, index);
      varDataList.appendChild(new Option("", item));
    });

    varValidList = propertyNames;
}

function setMetricsNamesDataList() {
    const data = metricsData;
    const namesList = data.names;
    varDataList.innerHTML = '';
    namesList.sort().forEach(function (item, index) {
      console.log(item, index);
      varDataList.appendChild(new Option("", item));
    });

    varValidList = namesList;
    console.log(namesList);
}

function loadContent() {
    fetch(actuatorRoot)
    .then((res) => res.json())
    .then((data) => {
        initActuators(data);
        
        fetch(actuatorRoot+'/env')
        .then((res) => res.json())
        .then((data) => { envPropData = data; })
        .catch((err) => { console.log(err); })

        fetch(actuatorRoot+'/metrics')
        .then((res) => res.json())
        .then((data) => { metricsData = data; })
        .catch((err) => { console.log(err); })
//        Promise.all([
//        	fetch(actuatorRoot+'/env'),
//        	fetch(actuatorRoot+'/metrics')
//        ])
//        .then((response) => console.log(response))
//        .then((data) => console.log(data))
//        .catch((err) => console.log(err));
    })
    .catch((err) => { console.log(err); });
}

function changeInput(uri) {
    if(uri.includes("/env/{toMatch}")) {
        varArea.style.visibility  = "visible";
        setEnvPropsDataList();
    } else if(uri.includes("/metrics/{requiredMetricName}")) {
        varArea.style.visibility  = "visible";
        setMetricsNamesDataList();
    } else {
        varArea.style.visibility  = "hidden";
    }
    varInput.value = "";
}

function actuatorChanged() {
    const uri = actuatorSelector.value;
    changeInput(uri);
    console.log(uri);
    const name = uri.includes("{") ? 
        uri.replace(/.*{/, "").replace(/}.*/, ""):null;
    const value = uri.includes("{") && varInput.uri?
        varInput.uri.trim() : "";

    if(name != null && value.length == 0) {
        contentFrame.src = 'prism/index.html?uri=-';
    } else {
        const realUri=actuatorSelector.value.replace("{"+name+"}", value);
        contentFrame.src = 'prism/index.html?uri='+encodeURI(realUri);
    }
}

actuatorSelector.addEventListener("change", function() {
    varInput.uri = null;
    actuatorChanged();
    varInput.placeholder = "Search value...";
});
//varInput.addEventListener("keyup", function(event) {
//    if (event.key === "Enter") {
//        actuatorChanged();
//    }
//});
varInput.addEventListener("change",function () {
    if(varValidList.includes(varInput.value)) {
        varInput.placeholder = varInput.value;
        varInput.uri = varInput.value;
        varInput.value="";
        actuatorChanged();
    }
});

loadContent();
