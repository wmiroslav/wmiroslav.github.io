"use strict";


// sort array of objects by some property
// example: sort airplanes by altitude
Array.prototype.sortBy = function(prop) {
    return this.sort(function(obj1, obj2) {
        return obj2[prop] - obj1[prop];
    });
};
 

// make HTTP GET request
function httpGetAsync(url, successCallback, errorCallback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if(xmlHttp.status == 200) {
                successCallback(JSON.parse(xmlHttp.responseText));
            } else {
                errorCallback(xmlHttp.status);
            }
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}



