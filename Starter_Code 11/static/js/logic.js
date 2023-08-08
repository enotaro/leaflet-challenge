// Define the URL for GeoJSON data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(url)

// Fetch GeoJSON data
d3.json(url).then(function(geoJson) {
    console.log(geoJson)
});

// Define color code for earthquake depth
function colorCode(depth) {
    return depth >= 90 ? 'red':
           depth >= 70 ? 'tomato':
           depth >= 50 ? 'orange':
           depth >= 30 ? 'yellow':
           depth >= 10 ? 'greenyellow':
           depth >= 0 ? 'green';
}

// Create map and initialize layers
function createMap(earthquakeInfo) {

    var baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });


    var baseLayers = {
        "Map": baseMap
    };

    var overlays = {
        "Earthquakes": earthquakeInfo
    };

    var myMap = L.map('map', {
        center: [38, -98],
        zoom: 4,
        layers: [baseMap, earthquakeInfo]
    });

    L.control.layers(baseLayers, overlays).addTo(myMap);

// Create Legend for Earthquake Depth
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

    myLegend.addTo(myMap);
  
}

// Create marker for each earthquake
function makeMarkers(response) {

    var earthquakes = response.features;

    // Empty list to hold the markers
    var earthquakeMarkers = [];

    // Loop through earthquake info to make a marker for each earthquake
    for (let i = 0; i < earthquakes.length; i ++) {
        var earthquake = earthquakes[i];

        // Make a circle at each earthquake location
        var earthquakeMarker = L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
            fillOpacity:0.5,
            radius: earthquake.properties.mag * 10000
        }).bindPopup(`<h1>${earthquake.properties.place}</h1> <h3>Lat: ${earthquake.geometry.coordinates[1]}</h3><h3>Lon: ${earthquake.geometry.coordinates[0]}</h3><h3>Magnitude: ${earthquake.properties.mag}</h3><h3>Depth: ${earthquake.geometry.coordinates[2]}</h3> `)

        earthquakeMarkers.push(earthquakeMarker);
    }
    // Add earthquake markers to map
    createMap(L.layerGroup(earthquakeMarkers));
}

// Fetch Geo JSON and call the makeMarkers function
d3.json(url).then(function(data) {
    makeMarkers(data);
});