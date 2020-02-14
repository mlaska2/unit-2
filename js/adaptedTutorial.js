//Adapting geojsonTutorial to add in MegaCities.geojson; Matthew Laska; G575 Spring 2020

/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var laskaMap;

//function to instantiate the Leaflet map
function createMap() {
	laskaMap = L.map('mapid', {
		center: [20,0],
		zoom: 2
	});

	//add OSM base tilelayer
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 5
	}).addTo(laskaMap);

	//call getData function
	getData();
};

//function to convert geojson points into stylized leaflet circle markers
function pointToLayer(feature, latlng) {
	//create marker options
	var geojsonMarkerOptions = {
		radius: 6,
		fillColor: "#42CA5A",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.75
	};
	return L.circleMarker(latlng, geojsonMarkerOptions);
};

//function to attach popups to each of the features being mapped
function onEachFeature(feature, layer) {
	var popupContent = "";
	if (feature.properties) {
		//loop to add feature property names and values to html string
		for (var property in feature.properties) {
			popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
		};
		layer.bindPopup(popupContent);
	};
};

//function to retrieve the data and place it on the map
function getData() {
	//load the data:
	$.getJSON("data/MegaCities.geojson", function(response){

		//create a Leaflet GeoJSON layer and add it to the map
		L.geoJson(response, {
			pointToLayer: pointToLayer,
			onEachFeature: onEachFeature
		}).addTo(laskaMap);
	});
};

$(document).ready(createMap)

//unused code that was copied over from the geojsonTutorial is below - can be used for reference

// function onEachFeature(feature, layer) {
//     // does this feature have a property named popupContent?
//     if (feature.properties && feature.properties.popupContent) {
//         layer.bindPopup(feature.properties.popupContent);
//     }
// };
//
// var geojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!"
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// };
//
// //L.geoJSON: creates a geojson layer; also accepts objects in geoJSON format to display on the map
// //onEachFeature: function that gets called once for each feature after it has beeen created and styled but before being added to the geojson layer, good for attaching popups and evenrs
// L.geoJSON(geojsonFeature, {
//     onEachFeature: onEachFeature
// }).addTo(mymap);
//
// var myLines = [{
//     "type": "LineString",
//     "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
// }, {
//     "type": "LineString",
//     "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
// }];
//
// var myStyle = {
//     "color": "#ff7800",
//     "weight": 5,
//     "opacity": 0.65
// };
//
// //style: geojson option - object or function defining the path options for styling geojson lines/polygons
// L.geoJSON(myLines, {
//     style: myStyle
// }).addTo(mymap);
//
// var states = [{
//     "type": "Feature",
//     "properties": {"party": "Republican"},
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [[
//             [-104.05, 48.99],
//             [-97.22,  48.98],
//             [-96.58,  45.94],
//             [-104.03, 45.94],
//             [-104.05, 48.99]
//         ]]
//     }
// }, {
//     "type": "Feature",
//     "properties": {"party": "Democrat"},
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [[
//             [-109.05, 41.00],
//             [-102.06, 40.99],
//             [-102.03, 36.99],
//             [-109.04, 36.99],
//             [-109.05, 41.00]
//         ]]
//     }
// }];
//
// L.geoJSON(states, {
//     style: function(feature) {
//         switch (feature.properties.party) {
//             case 'Republican': return {color: "#ff0000"};
//             case 'Democrat':   return {color: "#0000ff"};
//         }
//     }
// }).addTo(mymap);
//
//
// var geojsonMarkerOptions = {
//     radius: 8,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };
//
// //pointToLayer: function to create geojson point in leaflet layers, created with latlng - returns usually marker or circle
// //L.circleMarker: creates a circle marker given a geog. point, with an optinos options object
// L.geoJSON(geojsonFeature, {
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).addTo(mymap);
//
// var someFeatures = [{
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "show_on_map": false
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// }, {
//     "type": "Feature",
//     "properties": {
//         "name": "Busch Field",
//         "show_on_map": false
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.98404, 39.74621]
//     }
// }];
//
// //filter: function used to decided whether a feature will be included or not, controlling its visibility
// L.geoJSON(someFeatures, {
//     filter: function(feature, layer) {
//         return feature.properties.show_on_map;
//     }
// }).addTo(mymap);
