var bleBean = require("ble-bean");

var STALE_BEAN_TIMEOUT_MS = 30 * 1000;
var _discoveredBeans = new Array();
var _isScanning = false;

var discoveredBean = function (bean){
    _discoveredBeans.push(bean);
    setTimeout(function(){
        _discoveredBeans.shift();
    },STALE_BEAN_TIMEOUT_MS)
    //console.log(exports.getDiscoveredBeans());
}

exports.startScanning = function(){ 
    if(_isScanning === true){
        return false;
    }
    _isScanning = true;
    bleBean.SCAN_DUPLICATES = true;
    bleBean.discoverAll(discoveredBean);
	return true;
}

exports.stopScanning = function(){ 
    _isScanning = false;
    bleBean.stopDiscoverAll(discoveredBean);
    return true;
}


exports.getDiscoveredBeans = function(){ 
    var nonDuplicatedAssociativeArray = {};
    var nonDuplicatedArray = [];
    var arrResult
    for (i = 0; i < _discoveredBeans.length; i++) {
        var item = _discoveredBeans[i];
        nonDuplicatedAssociativeArray[item.uuid] = item;
    }
    i = 0;    
    for(var item in nonDuplicatedAssociativeArray) {
        nonDuplicatedArray[i++] = nonDuplicatedAssociativeArray[item];
    }
    return nonDuplicatedArray;
}