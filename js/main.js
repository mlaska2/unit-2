//Leaflet Lab #1, Matthew Laska, G575 Spring 2020

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

    //creating basemap tilelayer and adding to map
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
            //add the value to the array
            allValues.push(value);
        }
    }

    //get min, max stats for the array and add to dataStats object
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    //calculate mean and add it to dataStats object
    var sum = allValues.reduce(function(a,b){return a+b;});
    dataStats.mean = sum/allValues.length;
};

// function to calculate the radius of each prop symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    //chose 3 because any bigger makes map reading difficult
    var minRadius=3

    //flannary appearance compensation formula
    var radius = 1.0083*Math.pow(attValue/dataStats.min,0.5715)*minRadius

    return radius
};

//create global variable to put point layers from each state for filter
var circleLayers = []

//function to convert point markers to circles
function pointToLayer(feature, latlng, attributes) {
    //Determine which attribute to visualize with prop symbols
    var attribute = attributes[0];

    //create default marker options for the circles
    var circleOptions = {
        radius: 4,
        fillColor: "#848484", //000000 because CO2 dirty, so visualize in black?
    	color: "#000",
    	weight: 1,
    	opacity: 1,
    	fillOpacity: 0.6
    };

    //For each feature, get the value for the selected attribute in number form
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    circleOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var circleLayer = L.circleMarker(latlng, circleOptions);

    //assign popupContent to the function that creates popups
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup object to the circle marker layer
    circleLayer.bindPopup(popupContent);

    //save the circle layers using State as reference for the filter
    circleLayers[feature.properties["State"]]=circleLayer

    //return the circle marker layer to the L.geoJson pointToLayer function
    return circleLayer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
    //create Leaflet geoJSON layer and add it to map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(laskaMap);
};

//function to update the filter
function updateFilter(map, attribute, lowerLimitNumber, upperLimitNumber) {
    for (layer in circleLayers) {

        //check if the layer has features and properties
        if (circleLayers[layer].feature && circleLayers[layer].feature.properties[attribute]) {

            //check if the circlelayer is within the upper and lower limits specified by the filter
            if (circleLayers[layer].feature.properties[attribute] >= lowerLimitNumber && circleLayers[layer].feature.properties[attribute] <= upperLimitNumber) {
                //add the circles to the map that meet this condition
                laskaMap.addLayer(circleLayers[layer]);
                updatePropSymbols(laskaMap, attribute)
            } else {
                //remove the circle layers that dont meet the condition
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

        //onAdd method specifying a function to create DOM element, executed when the control is added to the map
        onAdd: function () {
            //create control container div with a specified class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider) for sequencing
            $(container).append('<input class="range-slider" type="range">');

            //create step buttons for sequence
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

            //create filter sliders and area to display the filter limits
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

        //update the layer to filter based on currently specified limits
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function() {
        //get the new index value
        var index = $(this).val();

        //update the layer to filter based on currently specified limits
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

    //set attributes of upper and lower limit sliders for filter
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

    // add text to display start limits for filter
    $('#lowerLimitNumber').html(5);
    $('#upperLimitNumber').html(718);

    //add input listener for upper and lower filters
    $('.lowerLimitSlider').on('input', function() {
        //update the circle layers based on the given input
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());
        //change the text display of the current limit value accordingly
        $('#lowerLimitNumber').html($('.lowerLimitSlider').val());
    });

    $('.upperLimitSlider').on('input', function() {
        //update the circle layers based on the given input
        updateFilter(laskaMap, attributes[$('.range-slider').val()], $('.lowerLimitSlider').val(), $('.upperLimitSlider').val());
        //change the text display of the current limit value accordingly
        $('#upperLimitNumber').html($('.upperLimitSlider').val());
    });

};

//function to create popup and eliminate redundancies in other functions
function createPopupContent(properties, attribute) {
    //add State to popup content string
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

            //update popup content with new info
            popup=layer.getPopup();
            popup.setContent(popupContent).update();

            //replace year in temporal legend with updated year
            $('.years').html('CO<sub>2</sub> Emissions in ' + attribute.split("_")[1])
        };
    });
};

//function to create and populate temporal/attribute legend
function createLegend(laskaMap, attributes) {
    var LegendControl = L.Control.extend({
        options: {
          position: 'bottomright'
        },

        onAdd: function(laskaMap) {
            //create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to the container
            $(container).append('<div id="temporal-legend">');

            //create svg string element for the attribute legend container
            var svg = '<svg id="attribute-legend" width="150px" height="110px">';

            //create array of circle names to base loop on for legend
            var circlesArray = ['max','mean','min'];

            //loop to add each circle and text to svg string
            for (var i=0; i<circlesArray.length; i++) {

                //assign the radius and y position attributes of svg circles
                var radius = calcPropRadius(dataStats[circlesArray[i]]);
                var cy = 109 - radius;

                //create circle string
                svg += '<circle class="legend-circle" id="' + circlesArray[i] +
                '" r="' + radius + '" cy="' + cy +
                '" fill="#848484" fill-opacity="0.6" stroke="#000000" cx="57"/>'; //#42CA5A

                //set y position of attribute legend text
                textYArray = [65,85,105]

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

    //add temporal legend content to the div in the container
    var year = attributes[0].split("_")[1]
    content = '<b class = "years">CO<sub>2</sub> Emissions in ' + year + '</b><br><b>(in million metric tons)</b>'
    $('#temporal-legend').append(content)
};

//function to build an attributes array from the response getData
function processData(data) {
    //create empty array to hold attributes ('tons_1990', 'tons_1991', etc.)
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

        //call function to calculate statistics
        calcStats(response);

        //call function to create proportional symbols
        createPropSymbols(response, attributes);

        //call function to create controls
        createSequenceControls(attributes);

        //call function to create legend
        createLegend(laskaMap, attributes);
    });
};

//perform createMap function when the document is ready
$(document).ready(createMap)
