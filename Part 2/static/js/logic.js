// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Create additional base maps
let street = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenTopoMap contributors'
});

let satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [37.00, -97.0],
  zoom: 2,
  layers: [basemap]
});

// Add the 'basemap' tile layer to the map.
basemap.addTo(map);

// Create layer groups for earthquakes and tectonic plates
let earthquakes = new L.LayerGroup();
let tectonic_plates = new L.LayerGroup();

// Define base maps
let baseMaps = {
  "Basemap": basemap,
  "Street Map": street,
  "Satellite": satellite
};

// Define overlays
let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

// Add layer control to the map
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve the earthquake geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#ff5f65" :
           depth > 70 ? "#fca35d" :
           depth > 50 ? "#fdb72a" :
           depth > 30 ? "#f7db11" :
           depth > 10 ? "#dcf400" : "#a3f600";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`);
    }
  }).addTo(earthquakes);

  // Add the earthquakes layer to the map
  earthquakes.addTo(map);
});

// Retrieve the tectonic plates geoJSON data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
  // Add the tectonic plates data to the map with specific styling
  L.geoJson(plate_data, {
    color: "orange",
    weight: 2
  }).addTo(tectonic_plates);

  // Add the tectonic plates layer to the map
  tectonic_plates.addTo(map);
});

// Initialize depth intervals and colors for the legend
let legend = L.control({
  position: "bottomright"
});

// Add the details to the legend
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

  // Loop through our depth intervals to generate a label with a colored square for each interval.
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
  }
  return div;
};

// Finally, add the legend to the map.
legend.addTo(map);