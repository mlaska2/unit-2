//Leaflet Quick Start Guide; Matthew Laska; G575 Spring 2020

//L.Map: represents a map object given in this case the ID of a <div> element
//.setView: a method for modifying the map state, it sets the view of the map (geog. center and zoom)
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//L.tileLayer: instantiates a tile layer object using the provided URL template, followed by optional options object
//.addTo: adds the layer/feature to the input map or layer group
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(mymap);

//L.marker: creates a marker objet given a geopgraphical point (lat/lon values)
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//L.circle: creates a circle object given a geog. point (lat/lon values) and can specify radius in the options object
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

//L.polygon: creates a polygon object from an array of latlon values, don't need to repeat the first point at the end
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//.bindPopup: binds a popup to the layer/feature with the passed content
//.openPopup: opens the popup at a specified latlon or at the default popup anchor
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//L.popup: creates a popup object given an optional options object describing location and appearance
//.setLatLng: sets geog. point where popup will open
//.setContent: sets the content that will display in the popup
//.openOn: adds the popup to the map and closes the previous one
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

var popup = L.popup();

//.toString: returns a string of the point
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

//.on: adds a listener function to an event of the object
mymap.on('click', onMapClick);
