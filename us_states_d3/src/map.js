// # d3.js script for drawing a heatmap.
// # inputs: state_sentiments.txt (json file with state / sentiment score / frequency of responses)
// #         us.json (topojson map file with paths for us states)
// #         us-state-names.tsv (tsv file with us state names and 2 letter codes)
// # 
// # 
// #  the script renders a map of the USA states to the #map div. 
// #  the states are coloured according to average sentiment score
// #  the map is zoomable (by mouse scroll) and if you hover over a state, you will see its name and sentiment score


// load necessary data
queue()
  .defer(d3.json, "data/state_sentiments.txt")
  .defer(d3.json, "data/us-congress-113/us.json")
  .defer(d3.tsv, "data/us-congress-113/us-state-names.tsv")
  .await(ready);

// proceed only when queued files are all loaded
function ready(error, data, us, names) {

  // make dicts for state > freq and state > score
  var stateFreq = {};
  var stateScore = {};
  for (var i = 0; i < data.length; i++) {
    stateScore[data[i].state] = data[i].score
    stateFreq[data[i].state] = data[i].freq
  }

  // find the maximum sentiment score
  var max = d3.max(data, function(d) {
    return d.score;
  })

  // scaffolding for map svg
  var width = 800,
    height = 600;

  // create 9 bins for sentiment scores: these are added as classed to the state svg elements. 
  // shades of colour for each bin are specified in main.css 
  var quantize = d3.scale.quantize()
    .domain([0, max])
    .range(d3.range(9)
    .map(function(i) {
    return "q" + i + "-9";
  }));

  // initialize the map projection. We use the Albers projection
  var mapXY = d3.geo.albers()
    .scale(600)
    .translate([width / 2 + 20, height / 2]);

  // initialize object to hold paths for each state, add the map projection
  var path = d3.geo.path()
    .projection(mapXY);

  // initialize a zoom objection, tell it to translate and scale the map, responding to 'zoom' events. 
  var zoom = d3.behavior.zoom()
    .translate(mapXY.translate())
    .scale(mapXY.scale())
  // .scaleExtent([height, 8 * height])
  .on("zoom", zoom);

  // create a top level object to hold the svg, which is appended to the DOM under the #map div. set its attributes.
  var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)

  // insert a layer to hold the paths
  var pathsLayer = svg.insert("svg:g", ".compass")
    .attr('class', 'path')

  // add a blank rect - this is the layer that will listen to zoom events.
  pathsLayer.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none');

  // the zoom function translates the map projection, and redraws the paths
  function zoom() {
    mapXY.translate(d3.event.translate)
      .scale(d3.event.scale);
    pathsLayer.selectAll("path")
      .attr("d", path);
  }

  function transform(d) {
    coords = [d.value.lon, d.value.lat];
    return "translate(" + mapXY(coords) + ")";
  }


  // add a 'g' group to hold the paths, one for each state
  // this is how adding svg elements works in d3:
  // 1: select the paths (create a placeholder reference)
  // 2: specify the data array and enter it (loop over its elements)
  // 3: append svg elements, give them classes / properties
  // in this case we give them a class according to the sentiment score bin they call into, using the quantize function
  pathsLayer.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.object(us, us.objects.states)
    .geometries)
    .enter()
    .append("path")
    .attr("class", function(d, i) {
      if (stateScore[names[i].code]) {
        console.log(quantize(stateScore[names[i].code]))
        return quantize(stateScore[names[i].code]);
    } else {
        console.log("q0")
        return "q0";
    }
  })
    .attr("d", path)

  // let each path listen for mouseover events and respond by showing the tooltip
  // the tooltip div is passed two bits of text, the state name, and its avg sentiment score
    .on("mouseover", function(d, i) {
    var mouse = d3.mouse(this.parentNode);
    var offsetTop = d3.select('#map')
      .property('offsetTop')
    var offsetLeft = d3.select('#map')
      .property('offsetLeft')
    var tip = d3.select("#tooltip")
      .style("left", (offsetLeft + mouse[0] + 10) + "px")
      .style("top", (offsetTop + mouse[1]) + "px");
    tip.select("#value")
      .text(function() {
      return stateScore[names[i].code].toFixed(2);
    })
    tip.select("#title")
      .text(names[i].name);
    //Show the tooltip
    d3.select("#tooltip")
      .classed("hidden", false);
  })

  // hide the tooltip on mouseout
    .on("mouseout", function(d) {
    d3.select("#tooltip")
      .classed("hidden", true);
  })



};