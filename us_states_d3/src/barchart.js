var w = 600;
var h = 300;

var svg = d3.select("#visualisation")
			.append("svg")
			.attr("width" ,w)
			.attr("height" ,h)

d3.csv('/data/leads_table.txt', function (data) {
	var rectangles = svg.selectAll("rect")
			.data(data)
			.enter()
			.append('rect');

	rectangles.attr('x', function (d,i) {
		return i * 7;
	})
			.attr('y', 0)
			.attr('width', 5)
			.attr('height', h)
			.attr('fill', 'blue')
}) 

