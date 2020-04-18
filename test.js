"use strict";

const mapQuestKey = "uAwPs4gZNB3ofJNPyN7Z0k4A3KsXsKAZ";
const mapQeuestURL = "http://www.mapquestapi.com/geocoding/v1/address?";
const openWeatherKey = "f214e925612ff5d19b7d84595cd06955";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/onecall?";
const iconURL = "http://openweathermap.org/img/wn/";

(async() => {

    // Given a place as plain text string, returns object containing
    // corresponding latitude and longitude coordinates.  See MapQuest
    // API documentation for full object definition.
    function getGeocoordinates(place) {
        return $.ajax({
            url: mapQeuestURL + $.param({
                key: mapQuestKey,
                location: place,
                maxResults: 1,
            }),
            method: "GET",
        });
    }

    // Given a geoCoordinate object return by getGeocoordinates(), returns
    // object containing corresponding weather data.  See OpenWeather API
    // documentation for a full object definition.
    function getWeatherInfo(obj) {
        return $.ajax({
            url: openWeatherURL + $.param({
                lat: obj.results[0].locations[0].latLng.lat,
                lon: obj.results[0].locations[0].latLng.lng,
                appid: openWeatherKey,
                units: "imperial",
            }),
            method: "GET",
        });
    }




})();