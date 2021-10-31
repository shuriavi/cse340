// Public auth for initializing the map
var mapMain = 'simihuriavi';
L.mapbox.accessToken = 'shskdhf';

// Quantile or Jenks classification
var type = $("#type").val();
var breaks;
// Color scale using chroma.js
var scale = chroma.scale('YlOrBr');

// Create the base map using Mapbox
map = L.mapbox.map('map', mapMain, {
    attributionControl: false,
    maxZoom: 12,
    minZoom: 5
}).setView([34.0261899,-118.2455643], 8);
  
// Calculate population density for each county
_.each(counties.features, function(feature) {
    // Population from 2010 Census
    var pop = feature.properties.POP;
    // Calcualate desnity as popluation / square meters 
    var area = turf.area(feature.geometry);
    var sq_miles = area * 0.000000386102158542;
    feature.properties.pop_density = (pop / sq_miles);
});

updateMap();

// Show the Choropleth of Population Density
function updateMap() {
  // Make a Turf collection for analysis
   collection = turf.featurecollection(counties.features);

   // Basic UI for select Jenks or Quantile classification
   if (type == "jenks") {
    breaks = turf.jenks(collection, "pop_density", 8);
   } else {
      breaks = turf.quantile(collection, "pop_density", [25, 50, 75, 99]);
   }
  // Get the color when adding to the map
   var layer = L.geoJson(counties, { style: getStyle })
   layer.addTo(map);
   // Fit to map to counties and set the legend
   map.fitBounds(layer.getBounds());
   updateLegend();
  
   function getStyle(feature) {
    var pop = feature.properties.POP;
      var pop_density = feature.properties.pop_density;
      return {
        fillColor: getColor(pop_density),
         fillOpacity: 0.7,
         weight: 1,
         opacity: 0.2,
         color: 'black'
    }
   }
  
   function updateLegend() {
    $(".breaks").html();
      for(var i = 0; i < breaks.length; i++) {
        var density = Math.round(breaks[i] * 100) / 100;
         var background = scale(i / (breaks.length));
         $(".breaks").append("<p><div class='icon' style='background: " + background + "'></div><span> " + density  + " <span class='sub'>pop / mi<sup>2</sup></span></span></p>");
    }
  }
}

/* Get color depending on population density value */
function getColor(d) {
   // Select a color scale from Color Brewer 
   var color = scale(0);
   // Place the feature based upon breaks
   for (var i = breaks.length - 1; i >= 0; i--) {
    if (d < breaks[i]) {
    // Automatic way to select the color by class
        var percentage = (i / (breaks.length));
      color = scale(percentage);
      }
  }
  return color; 
}