"use strict";

const mapQuestKey = "uAwPs4gZNB3ofJNPyN7Z0k4A3KsXsKAZ";
const mapQeuestURL = "http://www.mapquestapi.com/geocoding/v1/address?";
const openWeatherKey = "f214e925612ff5d19b7d84595cd06955";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/onecall?";
const iconURL = "http://openweathermap.org/img/wn/";


async function foo(place) {
    return $.ajax({
        url: mapQeuestURL + $.param({ key: mapQuestKey, location: place, maxResults: 1 }),
        method: "GET"
    });
}

console.log(foo("Durham, NC"));

// Displays weather data for given place on the page
function displayWeatherData(place) {
    // Get geocoordinates
    $.ajax({
        url: mapQeuestURL + $.param({ key: mapQuestKey, location: place, maxResults: 1 }),
        method: "GET"
    }).then(function(obj) {
        // Get weather data
        $.ajax({
            url: openWeatherURL + $.param({
                lat: obj.results[0].locations[0].latLng.lat,
                lon: obj.results[0].locations[0].latLng.lng,
                appid: openWeatherKey,
                units: "imperial"
            }),
            method: "GET"
        }).then(function(obj) {
            //display current weather to page
            $("#placeDate").text(place + " " + moment.unix(obj.current.dt).format("M/D/YYYY"));
            $("#icon").attr("src", iconURL + obj.current.weather[0].icon + ".png");
            $("#temp").text(obj.current.temp + " °F");
            $("#humidity").text(obj.current.humidity + "%");
            $("#windSpd").text(obj.current.wind_speed + " MPH");
            $("#uvIndex").text(obj.current.uvi);
            //display 5 day forecast
            $("#fiveDay").empty();
            for (var i = 0; i < 5; i++) {
                displayCard({
                    date: moment.unix(obj.daily[i].dt).format("M/D/YYYY"),
                    icon: obj.daily[i].weather[0].icon,
                    temp: obj.daily[i].temp.day,
                    humidity: obj.daily[i].humidity
                });
            }
            //create entry in history
            $("#history").append($("<button>").text(place).addClass("column is-12"));
        });
    });
}




// Displays card with given weather data to page.  Weather is given as object defined 
// as {date: <date>, icon: <icon code>, temp: <value>, humidity: <value>}
function displayCard(data) {
    var card = $("<div>").addClass("card column is-2");
    card.append($("<b>").text(data.date)); //date
    card.append($("<br><img>").attr("src", iconURL + data.icon + ".png")); //icon
    card.append($("<p>").text("Temp: " + data.temp + " °F")); //temp
    card.append($("<p>").text("Humidity: " + data.humidity + "%")); //humidity
    $("#fiveDay").append(card);
}

$(document).ready(function() {
    $("form").submit(function() {
        displayWeatherData($("input").val());
        return false;
    });
});