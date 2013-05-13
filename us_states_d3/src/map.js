queue()
  .defer(d3.json, "data/state_sentiments.txt")
  .defer(d3.json, "data/us-congress-113/us.json")
  .defer(d3.tsv, "data/us-congress-113/us-state-names.tsv")
  .await(ready);

function ready(error, data, us, names) {
  // this is the element you pass to the selection
  // turn the data into something useful.
  console.log(data, us, names);

  function getUSState(s) {
    var regex = /[^,]+, ([a-zA-Z]{2})/;
    var array = regex.exec(s)
    return array[1];
  }


  var stateFreq = {};
  var stateScore = {};
  // console.log(locations)
  for (var i = 0; i < data.length; i++) {
    // console.log(json[i].city)
    stateScore[data[i].state] = data[i].score
    stateFreq[data[i].state] = data[i].freq
  }

  console.log(stateFreq)

  var max = d3.max(data, function(d) {
    return d.score;
  })
  console.log(max)

  var width = 800,
    height = 600;

  var quantize = d3.scale.quantize()
    .domain([0, max])
    .range(d3.range(9)
    .map(function(i) {
    return "q" + i + "-9";
  }));

  // d3.select("#mapContainer") // why is this needed?
  //   .style("background-color", "black"); // why is this needed?
  var mapXY = d3.geo.albers()
    .scale(600)
    .translate([width / 2 + 20, height / 2]);

  var path = d3.geo.path()
    .projection(mapXY);

  var zoom = d3.behavior.zoom()
    .translate(mapXY.translate())
    .scale(mapXY.scale())
  // .scaleExtent([height, 8 * height])
  .on("zoom", zoom);

  var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)
  //
  var pathsLayer = svg.insert("svg:g", ".compass")
    .attr('class', 'path')
  // // .call(zoom)
  // .attr("pointer-events", "all")
  //   .append('svg:g')
  //     // .call(d3.behavior.zoom().on("zoom", zoom))
  //   .append('svg:g');

  pathsLayer.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none');

  // function redraw() {
  //     pathsLayer.attr("transform",
  //           "translate(" + d3.event.translate + ")"
  //           + " scale(" + d3.event.scale + ")");
  //     svg.selectAll("circle")
  //       .attr("transform",  "translate(" + d3.event.translate + ")");  
  //     }

  function zoom() {
    mapXY.translate(d3.event.translate)
      .scale(d3.event.scale);
    pathsLayer.selectAll("path")
      .attr("d", path);
    // svg.selectAll("circle")
    //   .attr("transform", transform);
  }

  function transform(d) {
    coords = [d.value.lon, d.value.lat];
    //console.log(mapXY(coords));
    return "translate(" + mapXY(coords) + ")";
  }

  ////////////// ready
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
    .on("mouseout", function(d) {
    d3.select("#tooltip")
      .classed("hidden", true);
  })





  // //
  // //


};