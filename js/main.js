//Start of Leaflet Lab #1, Matthew Laska, G575 Spring 2020
//very similar code to the other 3, don't think alot of commenting on the various things is necessary

//declare map variable in global scope
var laskaMap

//function to instantiate the Leaflet Map
function createMap() {
  laskaMap = L.map("mapid", {
    center: [39.83333, -98.58333],
    zoom: 4
  });
  //add basemap tilelayer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 5
	}).addTo(laskaMap);
  //call getData function
  getData();
};

//function to attach popups to each of the features being mapped
function onEachFeature(feature, layer) {
  var popupContent = "";
  if(feature.properties) {
    for (var property in feature.properties) {
      popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
    };
    layer.bindPopup(popupContent);
  };
};

//function to convert geojson points into stylized leaflet circle markers
//probably going to be getting rid of/changing because need prop. symbols
function pointToLayer(feature, latlng) {
  var geojsonMarkerOptions = {
    radius:5,
    fillColor: "#42CA5A",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.6
  };
  return L.circleMarker(latlng, geojsonMarkerOptions);
};

//function to retrieve the data and place it on the map
function getData() {
  $.getJSON("data/CO2_Emissions.geojson", function(response) {
  //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(response, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    }).addTo(laskaMap);
  });
};

//perform createMap function when the document is ready
$(document).ready(createMap)
