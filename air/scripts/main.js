"use strict";


(function() {

    var airplanes;
    var userPosition;
    var geolocationAllowBtn = document.getElementById('allowLocation');
    var geolocationDeniedBtn = document.getElementById('deniedLocation');
    var warningGeolocation = document.getElementById('warning');
    var list = document.getElementById('list');
    var loadingSpinner = document.getElementById('loading-spinner');
    var singleAirplane = document.getElementById('selected-airplane');
    // for selected airplane
    var closeBtn = document.getElementById('close-airplane');
    var manufacture = document.getElementById('manufacture');
    var model = document.getElementById('model');
    var destination = document.getElementById('destination');
    var origin = document.getElementById('origin');
    var logo = document.getElementById('logo');




    // when user allow to get location
    geolocationAllowBtn.addEventListener("click", getUserLocation);



    // when user denied or block geolocation, show warning message:
    function locationDenied() {
        // we have a few random question, so we get some question...
        var numberOfQuestions = config.enableGeolocationQuestion.length;
        var i = Math.floor((Math.random() * numberOfQuestions));
        // ...and show this question to user
        warningGeolocation.innerHTML = config.enableGeolocationQuestion[i];
        warningGeolocation.classList.add('fadein');
    }
    // when user denied to get location
    geolocationDeniedBtn.addEventListener("click", locationDenied);





    // callback function when we receive user latitute & longitude
    function onSuccessGetLocation(response) {
        // set response (latitude and longitude) to global variable
        userPosition = response;
        //remove event listener
        geolocationAllowBtn.removeEventListener("click", getUserLocation);
        geolocationDeniedBtn.removeEventListener("click", locationDenied);

        // remove element from DOM
        // we successfully get user location, so we not't need question anymore
        var wrapper = document.getElementById('questionWrapper');
        wrapper.remove();
        // and set visible airplanes list
        var airplanesContainer = document.getElementById('airplanes-container');
        airplanesContainer.classList.remove("hidden");
        
        // get data, and set interval to get data every X seconds...
        getData();
        setInterval(getData, config.dataRefreshTime);
    }

    // make HTTP erquest to get airplanes
    function getData() {
        setSpinner(true);
        var url = config.baseUrl + "AircraftList.json?lat=" + userPosition.coords.latitude + "&lng=" + userPosition.coords.longitude + "&fDstL=0&fDstU=" + config.range;
        httpGetAsync(url, onSuccessGetData, onErrorGetData)
    }


    // set spinner on UI: indicator for loading data...
    function setSpinner(show) {
        var display = show ? "block" : "none";
        loadingSpinner.setAttribute("style", "display:" + display);
    }


    // calculate icon orientation - icon class
    function getIconOrientation(angle) {
        var iconClass;
        if (angle > 0 && angle < 180) {
            iconClass = 'west';
        } else {
            iconClass = 'east';
        }
        return iconClass;
    }





    function closeModal() {
        singleAirplane.setAttribute("style", "display: hidden;");
        window.location.hash = '';
    }
    singleAirplane.addEventListener('click', function(e){
        if (e.target.id == 'selected-airplane') {
            closeModal();
        }
    })
    closeBtn.addEventListener('click', closeModal)


    // on successfully retrieve all airplanes
    function onSuccessGetData(response) {
        // first remove old data:
        while (list.firstChild) {
            list.firstChild.remove();
        }

        // if there's results, add them to the DOM
        airplanes = response.acList.sortBy("Alt");
        var numberOfNewAirplanes = airplanes.length;
        if (numberOfNewAirplanes > 0) {
            for (var i = 0; i < numberOfNewAirplanes; i++) {
                // create wrapper/row for airplane
                var wrapperLi = document.createElement("li");
                
                // create heading wrapper 
                var wrapperP = document.createElement("p");
                wrapperP.setAttribute("data-id", airplanes[i].Id);


                // add element for icon orientation
                var iconEl = document.createElement("span");
                iconEl.classList.add("icon-orientation");
                iconEl.classList.add(getIconOrientation(airplanes[i].Brng));

                // add element for altitude
                var altitudeEl = document.createElement("span");
                altitudeEl.innerHTML = airplanes[i].Alt || config.noData;
                altitudeEl.classList.add("altitude");

                // add element for code number
                var codeNumberEl = document.createElement("span");
                codeNumberEl.innerHTML = airplanes[i].CNum || config.noData;
                codeNumberEl.classList.add("code-number");

                // add new elements to DOM
                wrapperP.appendChild(iconEl);
                wrapperP.appendChild(altitudeEl);
                wrapperP.appendChild(codeNumberEl);
                wrapperLi.appendChild(wrapperP);
                list.appendChild(wrapperLi);
            }
        } else {
            // create wrapper/row for airplane
            // todo
            var wrapperLi = document.createElement("li");
            var wrapperP = document.createElement("p");
            wrapperP.innerHTML = config.noAirplanes;
            wrapperLi.appendChild(wrapperP);
            list.appendChild(wrapperLi);
        }
        setButtonsState(false);
        setSpinner(false);
    }

    // get data failed
    function onErrorGetData(errorStatus) {
        setSpinner(false);
        // if user has no internet connection
        if (errorStatus === 0) {
            alert(config.checkNetworkOrCORS);
        } else {
            // if some other error happened
            alert(config.errorOccurred);
        }
    }

    // set is loading to update UI - disable buttons
    function setButtonsState(isLoading) {
        if (isLoading) {
            geolocationAllowBtn.setAttribute("disabled", isLoading);
            geolocationDeniedBtn.setAttribute("disabled", isLoading);
        } else {
            geolocationAllowBtn.removeAttribute("disabled");
            geolocationDeniedBtn.removeAttribute("disabled");
        }
    }

    // on error get users location.
    // user denied to use geolocation, or some other unknown error...
    function onErrorGetLocation(error) {
        setButtonsState(false);
        if(error.code === 2) {
            alert(config.checkNetworkOrCORS);
        } else {
            // if user clock geolocation
            locationDenied();
        }
    }

    // get users geolocation
    function getUserLocation() {
        if (navigator.geolocation) {
            // get user geolocation and call callback function
            setButtonsState(true);
            navigator.geolocation.getCurrentPosition(onSuccessGetLocation, onErrorGetLocation);
        } else {
            // geolocation is not supported by this broswer
            // we set a message to user, and remove buttons from DOM
            warningGeolocation.innerHTML = config.geolocationNotSupported;
        }
    }


    //////////////
    // ROUTING
    //////////////
    function getAirplaneData() {
        var id = window.location.hash.substr(1); // get ID from URL, from hash
        if (id && airplanes) {
            // find selected airplane
            var selectedAirplane;
            for (var i = 0, length = airplanes.length; i < length; i++) {
                if (airplanes[i].Id == id) {
                    selectedAirplane = airplanes[i];
                    break;
                }
            }
            // SHOW selecterd airplane
            if (selectedAirplane && singleAirplane) {
                singleAirplane.setAttribute("style", "display: block;");
                console.log(selectedAirplane);
                manufacture.innerHTML = selectedAirplane.Man || config.noData;
                model.innerHTML = selectedAirplane.Mdl || config.noData;
                origin.innerHTML = selectedAirplane.From || config.noData;
                destination.innerHTML = selectedAirplane.To || config.noData;
        
                if(selectedAirplane.Op) {
                    var genericUrl = selectedAirplane.Op.replace(/\s/g, '') + ".com";
                    var logoUrl = config.logoBaseUrl + (config.logo[selectedAirplane.Op] || genericUrl);
                    logo.src = logoUrl;
                }
                
            } else {
                closeModal();
            }
        } else {
            closeModal();
        }
    }
    window.addEventListener('hashchange', getAirplaneData);
    
    list.addEventListener('click', function(e) {
        // get airplane ID from DOM
        var id = e.target.dataset.id || e.target.parentElement.dataset.id;
        // set url path (hash)
        window.location.hash = id;
    }, false);



   


    getAirplaneData(); //on init get data, for now it's pointless, because we don't store our geolocation and last results in local storage...
                        // so we could use: window.location.hash = ''; just to clean hash value...
})()




