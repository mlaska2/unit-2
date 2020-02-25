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

//function to **********************************
function pointToLayer(feature, latlng, attributes) {
  //Step 4: Determine which attribute to visualize with prop symbols
  var attribute = attributes[0];

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
function createPropSymbols(data, attributes) {
  //create Leaflet geoJSON layer and add it to map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(laskaMap);
};

//function to create sequence slider and buttons
function createSequenceControls(attributes) {
  //create range input element (slider)
  $('#panel').append('<input class="range-slider" type="range">');

  //set slider attributes
  $('.range-slider').attr({
    min:0,
    max:27,
    value:0,
    step:1
  });

  //add the step buttons
  $('#panel').append('<button class="step" id="reverse">Reverse</button>');
  $('#panel').append('<button class="step" id="forward">Forward</button>');
  //replace button content with images
  $('#reverse').html('<img src="img/leftArrow.png">');
  $('#forward').html('<img src="img/rightArrow.png">');

  //click listener for buttons
  $('.step').click(function() {
    //get the old index value
    var index = $('.range-slider').val();

    //increment or decrement depending on button clicked
    if ($(this).attr('id') == 'forward') {
        index++;
        //if past the last attribute, wrap around to first attribute
        index = index > 27 ? 0 : index;
    } else if ($(this).attr('id') == 'reverse') {
        index--;
        //if past the first attribute, wrap around to last attribute
        index = index < 0 ? 27 : index;
    };

    //update slider
    $('.range-slider').val(index);
    //console.log(index)
    //pass new attribute to update symbols
    updatePropSymbols(attributes[index]);
  });

  //input listener for slider
  $('.range-slider').on('input', function() {
    //get the new index value
    var index = $(this).val();
    //console.log(index)
    //pass new attribute to update symbols
    updatePropSymbols(attributes[index]);
  });
}; //have to define attributes in here??

//resizse the prop symbols according to new attribute values
function updatePropSymbols(attribute) {
  laskaMap.eachLayer(function(layer) {
    if (layer.feature && layer.feature.properties[attribute]) {
      //access feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      //add state to popup content string
      var popupContent = "<p><b>State: </b>" + props.State + "</p>";

      //add formatted attribute to panel content string
      var year = attribute.split("_")[1];
      popupContent += "<p><b>CO2 Emissions in " + year + ": </b>" + props[attribute] + " million metric tons</p>";

      //update popup content
      popup=layer.getPopup();
      popup.setContent(popupContent).update();
    };
  });
};

//function to build an attributes array from the response getData
function processData(data) {
  //create empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //push each attribute name into attributes array
  for (var attribute in properties) {
    //only take attributes with CO2 emissions allValues
    if (attribute.indexOf("tons")>-1) {
      attributes.push(attribute);
    };
  };

  //check result
  console.log(attributes);

  return attributes;
};


//function to retrieve the data and place it on the map
function getData() {
  //load the data
  $.getJSON("data/CO2_Emissions.geojson", function(response) {

    //create an attributes array
    var attributes = processData(response);

    //calculate the minimum data value
    minValue=calcMinValue(response);

    //call function to create proportional symbols
    createPropSymbols(response, attributes);
    createSequenceControls(attributes);
  });
};

//perform createMap function when the document is ready
$(document).ready(createMap)
