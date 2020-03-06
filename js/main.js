//Start of Leaflet Lab #1, Matthew Laska, G575 Spring 2020

//declare variables we want to access from multiple locations
var laskaMap;
var dataStats = {};

//function to instantiate the Leaflet Map
function createMap() {
    laskaMap = L.map("mapid", {
        center: [39.83333, -98.58333],
        zoom: 4,
        maxBounds: ([
            [76, -179.999],
            [0, -20]
        ])
    });

    //
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    	  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    	  subdomains: 'abcd',
    	  maxZoom: 5,
        minZoom: 3
  	}).addTo(laskaMap);

    //call getData function
    getData(laskaMap);
};

//function to calculate max, min, and mean of the dataset from an array of all the values and assign them to the dataStats object
function calcStats(data) {
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

    //get min, max, and mean stats for the array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    //calculate mean
    var sum = allValues.reduce(function(a,b){return a+b;});
    dataStats.mean = sum/allValues.length;
};

// function to calculate the radius of each prop symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius=3

    //flannary appearance compensation formula
    var radius = 1.0083*Math.pow(attValue/dataStats.min,0.5715)*minRadius

    return radius
};

//filter
var circleLayers = []

//function to **********************************
function pointToLayer(feature, latlng, attributes) {
    //Step 4: Determine which attribute to visualize with prop symbols
    var attribute = attributes[0];

    //create marker options
    var circleOptions = {
        radius: 4,
        fillColor: "#848484", //000000 because CO2 dirty, so visualize in black?
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

    //assign popupContent to the function that creates popup
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    circleLayer.bindPopup(popupContent);

//filter
    circleLayers[feature.properties["State"]]=circleLayer

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

function updateFilter(map, attribute, lowerLimitNumber, upperLimitNumber) {
    for (layer in circleLayers) {
        if (circleLayers[layer].feature && circleLayers[layer].feature.properties[attribute]) {
            if (circleLayers[layer].feature.properties[attribute] >= lowerLimitNumber && circleLayers[layer].feature.properties[attribute] <= upperLimitNumber) {
                laskaMap.addLayer(circleLayers[layer]);
                updatePropSymbols(laskaMap, attribute)
            } else {
                laskaMap.removeLayer(circleLayers[layer]);
            };
        };
    };
};

//function to create sequence slider and buttons
function createSequenceControls(attributes) {

    //create new sequence controls
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        //onAdd method specifying a function to create DOM element, executed when control is added to the map
        onAdd: function () {
            //create control container div with a specified class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //intitalize other DOM elements if needed here

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //create step buttons
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

//filter
            $(container).append('<span id = "lowerLimitNumber">')
            $(container).append('<input class="lowerLimitSlider" type = "range">');
            $(container).append('<input class="upperLimitSlider" type = "range">');
            $(container).append('<span id = "upperLimitNumber">')

            //disable mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    //add given control to the map
    laskaMap.addControl(new SequenceControl());

    //NOW can set attributes/edit things within the control

    //set slider attributes
    $('.range-slider').attr({
        min:0,
        max:27,
        value:0,
        step:1
    });

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
//filter
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());


        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function() {
        //get the new index value
        var index = $(this).val();

//filter
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

//filter
    $('.lowerLimitSlider').attr({
        min: 5,
        max: 718,
        value: 5,
        step: 1
    });

    $('.upperLimitSlider').attr({
        min: 5,
        max: 718,
        value: 718,
        step: 1
    });

    $('#lowerLimitNumber').html($('lowerLimitSlider').val());
    $('#upperLimitNumber').html($('upperLimitSlider').val());

    $('.lowerLimitSlider').on('input', function() {
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());
        $('#lowerLimitNumber').html($('.lowerLimitSlider').val());
    });

    $('.upperLimitSlider').on('input', function() {
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());
        $('#upperLimitNumber').html($('.upperLimitSlider').val());
    });

};

//function to create popup and eliminate redundancies in other functions
function createPopupContent(properties, attribute) {
    //add city to popup content string
    var popupContent = "<p><b>State:</b> " + properties.State + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>CO<sub>2</sub> Emissions in " + year + ":</b> " + properties[attribute] + " million metric tons</p>";

    return popupContent;
};

//resizse the prop symbols according to new attribute values
function updatePropSymbols(attribute) {
    laskaMap.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //assign popupContent to the function that creates popup
            var popupContent = createPopupContent(props, attribute);

            //update popup content
            popup=layer.getPopup();
            popup.setContent(popupContent).update();

            $('.years').html('CO<sub>2</sub> Emissions in ' + attribute.split("_")[1])
        };
    });
};

//work in progress
function createLegend(laskaMap, attributes) {
    var LegendControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },

        onAdd: function(laskaMap) {
            //create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT SCRIPT TO CREATE TEMPORAL LEGEND here

            //add temporal legend div to the container
            $(container).append('<div id="temporal-legend">');

            //Lesson 3 Step 1: add 'svg' element to the legend container
            var svg = '<svg id="attribute-legend" width="150px" height="110px">';

            //create array of circle names to base loop on
            var circlesArray = ['max','mean','min'];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circlesArray.length; i++) {

                //Step 3: assign the radius and y position attributes
                var radius = calcPropRadius(dataStats[circlesArray[i]]);
                var cy = 109 - radius;

                //create circle string
                svg += '<circle class="legend-circle" id="' + circlesArray[i] +
                '" r="' + radius + '" cy="' + cy +
                '" fill="#848484" fill-opacity="0.6" stroke="#000000" cx="57"/>'; //#42CA5A

                textYArray = [65,85,105]
//just hardcode the textY here
                //var textY = i*35+28

                //text string
                svg += '<text id="' + circlesArray[i] + '"-text" x="115" y="' + textYArray[i] + '">' +
                Math.round(dataStats[circlesArray[i]]*100)/100 + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute-legend svg to the container
            $(container).append(svg);

            //disable mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    laskaMap.addControl(new LegendControl());

    //still have to figure out how to do this with the sequence   //HOW???????
    var year = attributes[0].split("_")[1]
    content = '<b class = "years">CO<sub>2</sub> Emissions in ' + year + '</b><br><b>(in million metric tons)</b>'
    $('#temporal-legend').append(content)

    //probably a sign I have to create a new function to update the legend
      //updateLegend(laskaMap, attributes[0]);
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

    //check result. dont need in final version
    console.log(attributes);

    return attributes;
};

//function to retrieve the data and place it on the map
function getData() {
    //load the data
    $.getJSON("data/CO2_Emissions.geojson", function(response) {

        //create an attributes array
        var attributes = processData(response);

        //call function to calculate statistics
        calcStats(response);

        //call function to create proportional symbols
        createPropSymbols(response, attributes);

        //
        createSequenceControls(attributes);

        //
        createLegend(laskaMap, attributes);
    });
};

//perform createMap function when the document is ready
$(document).ready(createMap)
