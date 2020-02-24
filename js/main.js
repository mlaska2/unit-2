//Start of Leaflet Lab #1, Matthew Laska, G575 Spring 2020
//very similar code to the other 3, don't think alot of commenting on the various things is necessary

//declare map variable in global scope
var laskaMap
var minValue

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
  getData(laskaMap);
};

function calcMinValue(data) {
  //create empty array to store all data values
  var allValues =[];

  //loop through each state
  for (var state of data.features) {
    //loop through each year
    for (var year = 1990; year <= 2017; year+=1) {
      //get million metric tons CO2 for current year
      var value = state.properties["tons_"+ String(year)];
      //add value to array
      allValues.push(value);
    }
  }

  //get minimum value of the array
  var minValue = Math.min(...allValues)

  console.log("Minimum value is: " + minValue);
  return minValue;
};

// function to calculate the radius of each prop symbol
function calcPropRadius(attValue) {
  //constant factor adjusts symbol sizes evenly
  var minRadius=3

  //flannary appearance compensation formula
  var radius = 1.0083*Math.pow(attValue/minValue,0.5715)*minRadius

  return radius
};

function pointToLayer(feature, latlng) {
  //Step 4: Determine which attribute to visualize with prop symbols
  var attribute = "tons_2017";

  //create marker options
  var circleOptions = {
    radius: 4,
    fillColor: "#42CA5A", //000000 because CO2 dirty, so visualize in black?
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.6
  };

  //Step 5. For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  //Step 6. Give each feature's circle marker a radius based on its attribute value
  circleOptions.radius = calcPropRadius(attValue);

  //create circle marker layer
  var circleLayer = L.circleMarker(latlng, circleOptions);

  //build popup content string
  //var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

  //customize popupContent
  var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";
  var year = attribute.split("_")[1];
  popupContent += "<p><b>CO2 Emissions in " + year + ":</b> " + feature.properties[attribute] + " million metric tons</p>";

  //bind the popup to the circle marker
  circleLayer.bindPopup(popupContent//, //the offset was displacing the popup based on where I clicked, it wasn;t just putting it at the top of the circle as the example made it seem
    //{offset: new L.Point(0, circleOptions.radius)}
  );

  //return the circle marker layer to the L.geoJson pointToLayer function
  return circleLayer;
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data) {
  //create Leaflet geoJSON layer and add it to map
  L.geoJson(data, {
    pointToLayer: pointToLayer
  }).addTo(laskaMap);
};

//function to retrieve the data and place it on the map
function getData() {
  //load the data
  $.getJSON("data/CO2_Emissions.geojson", function(response) {
    //calculate the minimum data value
    minValue=calcMinValue(response);
    //call function to create proportional symbols
    createPropSymbols(response)
  });
};

//perform createMap function when the document is ready
$(document).ready(createMap)
