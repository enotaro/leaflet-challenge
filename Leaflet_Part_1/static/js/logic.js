// Fetch Geo JSON earthquake data from the USGS website
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Log the URL to the console for reference
console.log(url)

// Fetch Geo JSON data using D3 library and log the data to the console
d3.json(url).then(function(geoJson) {console.log(geoJson)});

// Create color code based on depth of each earthquake
function colorCode(earthquakeDepth) {
    return earthquakeDepth >= 90 ? 'red':
    earthquakeDepth >= 70 ? 'tomato':
    earthquakeDepth >= 50 ? 'orange':
    earthquakeDepth >= 30 ? 'yellow':
    earthquakeDepth >= 10 ? 'greenyellow':
                            'green';
}

// Create a Leaflet map to display earthquake data
function createMap(myEarthquakes) {

    // Define the base map layer using OpenStreetMap
    var baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    var baseLayers = {
    "Street": baseMap
    };
    
    var overlays = {
    "Earthquakes": myEarthquakes
    };
    
    // Initialize the map with base map and earthquake overlays
    var mymap = L.map('map', {
        center: [35, -95],
        zoom: 4.0,
        layers: [baseMap, myEarthquakes]
    });
    
    // Add layer control to toggle between base map and overlay
    L.control.layers(baseLayers, overlays).addTo(mymap);
    
    // Create a legend for earthquake depth
    var myLegend = L.control({position: "bottomright"});
    myLegend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var depths = [-10, 10, 30, 50, 70, 90];
    
        div.innerHTML += "<h3>Earthquake Depth</h3>"
    
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
            '<i style="background:' + colorCode(depths[i]) + '"></i> ' +
             depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add the legend to the map
    myLegend.addTo(mymap);
    }

// Create markers for each earthquake and add to the map
function makeMarkers(response) {
    var earthquakes = response.features;
    var earthquakeMarkers = [];

    // Loop through earthquake data and create markers
    for (let i = 0; i < earthquakes.length; i ++) {
        var earthquake = earthquakes[i];

        // Create a circle marker with earthquake data and bind a popup
        var earthquakeMarker = L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
            color: colorCode(earthquake.geometry.coordinates[2]),
            fillColor: colorCode(earthquake.geometry.coordinates[2]),
            fillOpacity: 0.5,
            radius: earthquake.properties.mag * 10000
        }).bindPopup(`<h1>${earthquake.properties.place}</h1> <h3>Lat: ${earthquake.geometry.coordinates[1]}</h3><h3>Lon: ${earthquake.geometry.coordinates[0]}</h3><h3>Magnitude: ${earthquake.properties.mag}</h3><h3>Depth: ${earthquake.geometry.coordinates[2]}</h3> `)

        // Add the marker to the array
        earthquakeMarkers.push(earthquakeMarker);
    }

    // Create a layer group from the markers and call the createMap function
    createMap(L.layerGroup(earthquakeMarkers));
}

// Fetch Geo JSON data using D3 library and call makeMarkers function
d3.json(url).then(function(data) {makeMarkers(data);});