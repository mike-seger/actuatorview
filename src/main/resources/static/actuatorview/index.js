"use strict";

import {attachAutoComplete} from './lib/autocomplete-util.js';

const actuatorRoot = "../actuator";
const actuatorSelector = document.getElementById('actuatorSelector');
const varArea = document.getElementById('varArea');
const varInput = document.getElementById('varInput');
const contentFrame = document.getElementById('content');

var envPropData = null;
var metricsData = null;

function containsToken(string, list) {
    return new RegExp(list.join('|')).test(string)
}

function initActuators(actuators) {
    let text = '';
    let links = actuators._links;
    let selectedOption = null;

    const defaults = ['health', 'info', 'env'];
    const excluded = ['caches', 'metrics$', 'heapdump', "loggers-name",
        "self", "shutdown", "health-path"];
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
    //console.log(text);
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
    //console.log(propertyNames);
    attachAutoComplete(varInput, propertyNames);
}

function setMetricsNamesDataList() {
    const data = metricsData;
    const namesList = metricsData.names.sort();
    attachAutoComplete(varInput, namesList);
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
    } else if(uri.includes("/health/{path}")) {
        varArea.style.visibility  = "visible";
        setMetricsNamesDataList();
    } else {
        varArea.style.visibility  = "hidden";
        varInput.uri = null;
    }
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
        var actName = uri.replace(/.*[\/]/, "");
        const textOnly = ['logfile', 'prometheus', 'threaddump', 'env-plain'];
        if(containsToken(actName, textOnly)) {
            contentFrame.src = 'plain/index.html?uri='+encodeURI(uri);
        } else {
            const realUri=actuatorSelector.value.replace("{"+name+"}", value);
            contentFrame.src = 'prism/index.html?uri='+encodeURI(realUri);
        }
    }
}

actuatorSelector.addEventListener("change", function() {
    varInput.uri = null;
    actuatorChanged();
    //varInput.placeholder = "Search value...";
});


varInput.addEventListener("change", function () {
    console.log("Change");
    varInput.uri = varInput._value;
    actuatorChanged();
});

loadContent();
