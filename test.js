"use strict";

const mapQuestKey = "uAwPs4gZNB3ofJNPyN7Z0k4A3KsXsKAZ";
const mapQeuestURL = "http://www.mapquestapi.com/geocoding/v1/address?";
const predictionURL = "http://www.mapquestapi.com/search/v3/prediction?"
const openWeatherKey = "f214e925612ff5d19b7d84595cd06955";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/onecall?";
const iconURL = "http://openweathermap.org/img/wn/";

(() => {

    // Given a place as a string, returns an object containing a corresponding
    // string corrected for punctuation and capitalization et cetera. I.E 
    // given "durham nc" or "DURHAM NC", function would return "Durham, NC".
    function formatPlaceName(place) {
        return $.ajax({
            url: predictionURL + $.param({
                key: mapQuestKey,
                limit: 1,
                q: place,
                collection: "address,adminArea",
            }),
            method: "GET",
        })
    }

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

    // Given a geocoordinates object returned by getGeocoordinates(), returns
    // object containing corresponding weather data.  See OpenWeather API
    // documentation for a full object definition.
    function getWeatherData(obj) {
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

    // Given weather data object returned by getWeatherInfo(), renders the
    // data to the page.  Place is location's name as plain text string.
    function renderWeatherData(obj, place) {
        $("#placeDate").text(place + " " + moment.unix(obj.current.dt).format("M/D/YYYY"));
        $("#icon").attr("src", iconURL + obj.current.weather[0].icon + ".png");
        $("#temp").text(obj.current.temp + " °F");
        $("#humidity").text(obj.current.humidity + "%");
        $("#windSpd").text(obj.current.wind_speed + " MPH");
        $("#uvIndex").text(obj.current.uvi);
        colorUVI(obj.current.uvi);
        //display 5 day forecast
        $("#fiveDay").empty();
        obj.daily.slice(0, 5).forEach((_, i) => {
            displayCard({
                date: moment.unix(obj.daily[i].dt).format("M/D/YYYY"),
                icon: obj.daily[i].weather[0].icon,
                temp: obj.daily[i].temp.day,
                humidity: obj.daily[i].humidity
            });
        })
    }

    // Displays card with given weather data to page.  Weather is given as object defined 
    // as {date: <date>, icon: <icon code>, temp: <value>, humidity: <value>}.
    function displayCard(data) {
        var card = $("<div>").addClass("card column is-2");
        card.append($("<b>").text(data.date)); //date
        card.append($("<br><img>").attr("src", iconURL + data.icon + ".png")); //icon
        card.append($("<p>").text("Temp: " + data.temp + " °F")); //temp
        card.append($("<p>").text("Humidity: " + data.humidity + "%")); //humidity
        $("#fiveDay").append(card);
    }

    // Given a place, creates a corresponding button in the history and updates
    // local storage.
    function updateHistory(place) {
        $("#history").empty()
        const history = JSON.parse(localStorage.getItem("history"));
        //check to see if place is already in history
        if (history.filter(element => element === place).length === 0) {
            createEntry(place);
            localStorage.setItem("history", JSON.stringify([place].concat(history)));
        }
        history.slice(0, 8).forEach(place => createEntry(place));
    }

    // Creates a single corresponding entry in the history section on the page.
    function createEntry(place) {
        const entry = $("<button>").text(place).addClass("column is-12");
        entry.click(function() { getTheWeather($(this).text()) });
        $("#history").append(entry);
    }

    // For given place, queries and displays weather data to the page.
    function getTheWeather(place) {
        getGeocoordinates(place).then(coordinates => {
            getWeatherData(coordinates).then(weatherData => {
                renderWeatherData(weatherData, place);
            });
        });
    }

    // Color code the UV index value
    function colorUVI(value) {
        if (value <= 2.5) $("#uvIndex").attr("style", "background-color: green;");
        else if (value > 2.5 && value <= 5.5) $("#uvIndex").attr("style", "background-color: gold;"); //yellow
        else if (value > 5.5 && value <= 7.5) $("#uvIndex").attr("style", "background-color: orange;"); //orange
        else if (value > 7.5 && value <= 10.5) $("#uvIndex").attr("style", "background-color: red;"); //red
        else if (value > 10.5) $("#uvIndex").attr("style", "background-color: purple;"); //purple
    }
    // Set up local storage and display history
    const history = JSON.parse(localStorage.getItem("history"));
    if (history === null) localStorage.setItem("history", "[]");
    else {
        getTheWeather(history[0]);
        colorUVI();
        updateHistory(history[0]);
    }

    // On form submission, run the queries and display results.
    $("form").submit(() => {
        const place = $("input").val();
        if (place != "") {
            getTheWeather(place);
            colorUVI();
            updateHistory(place);
        }
        $("input").val(""); //clear input field
        return false; //don't reload page
    });

    // localStorage.clear();


})();