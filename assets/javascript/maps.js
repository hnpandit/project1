// Rutgers Coding BootCamp - Full Stack Developer - Mon/Wed
// Project 1 - HealthySearch Ilene, Dan, Juan & Himanshu  
// maps.js - to interface with Google Maps APIs
// January 12, 2019
    
// Initialize Firebase
// App Key - w7UvEiaWJksvqgcOea4n
// App Code - HqRyRkE_CPdtcF-Qo5lXdA

// Global Variables
var platform;
var maptypes;
var map;

var longitude=0;
var latitude=0;

function displayMap()
{
    // Initialize platform
    platform = new H.service.Platform({
    'app_id': 'w7UvEiaWJksvqgcOea4n',
    'app_code': 'HqRyRkE_CPdtcF-Qo5lXdA',
    'useHTTPS': true,
    'useCIT': true
    });

    // Obtain the default map types from the platform object
    maptypes = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    map = new H.Map (
    document.getElementById('mapContainer'),
    maptypes.normal.map,
    {
      zoom: 10,
      center: { lng: longitude, lat: latitude }
    });
}

$("#showMap").on("click", function(event)
{
  event.preventDefault();

  // Get User Input
  longitude = $("#txtLongitude").val().trim();
  latitude = $("#txtLatitude").val().trim();
  
  $("#mapContainer").empty();
  $("#txtLongitude").val('');
  $("#txtLatitude").val('');
  displayMap();
})