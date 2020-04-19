"use strict";

const mapQuestKey = "uAwPs4gZNB3ofJNPyN7Z0k4A3KsXsKAZ";
const mapQeuestURL = "http://www.mapquestapi.com/geocoding/v1/address?";
const openWeatherKey = "f214e925612ff5d19b7d84595cd06955";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/onecall?";
const iconURL = "http://openweathermap.org/img/wn/";

(() => {

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
        createEntry(place);
        history.slice(0, 8).forEach(place => createEntry(place));
        localStorage.setItem("history", JSON.stringify([place].concat(history)));
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
    // Set up local storage history
    if (localStorage.getItem("history") === null) localStorage.setItem("history", "[]");

    // On form submission, run the queries and display results.
    $("form").submit(() => {
        const place = $("input").val();
        if (place != "") {
            getTheWeather(place);
            updateHistory(place);
        }
        $("input").val(""); //clear input field
        return false; //don't reload page
    });

    // localStorage.clear();


})();