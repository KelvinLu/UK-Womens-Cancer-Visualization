var data;

d3.json("assets/data/cancer_counts.json", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  main();
});

main = function() {
  var svg = document.getElementById('svg-container');

  var width = svg.clientWidth,
    height = 800,

    graphWidth = width * 0.5;
    graphWidthOffset = width - graphWidth;

    barWidth = graphWidth / Math.max.apply(null, data.map(function(d, i) { return d.cancers.length; }));

    categoryHeight = height / data.length;
    barHeight = categoryHeight * 0.667;
    barPadding = (categoryHeight - barHeight) * 0.5;

  var maxPercent = Math.max.apply(null, data.map(function(d, i) {
    return Math.max.apply(null, d.cancers.map(function(d, i) { return d.percentage; }));
  }));

  var numCancers = Math.max.apply(null, data.map(function(d, i) {
    return d.cancers.length;
  }));

  var unityScale = d3.scale.linear()
    .domain([0, maxPercent])
    .range([0, barHeight]);

  var opacityScale = d3.scale.pow()
    .domain([0, maxPercent])
    .range([0, 1]);

  var colorScale = d3.scale.ordinal()
    .range(colorbrewer.GnBu[numCancers] || colorbrewer.GnBu[3]);

  var everyOdd = function(d, i){ return i % 2; };

  var percentageFormat = d3.format("3.1%");

  // Regions
  //
  //

  var main = d3.select("#main")
    .attr("width", width)
    .attr("height", height);

  var category = main.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("width", width)
    .attr("height", categoryHeight)
    .attr("transform", function(d, i) { return "translate(0, " + i * categoryHeight + ")"; })

  var categoryBg = category.append("rect")
    .attr("width", width)
    .attr("height", categoryHeight)
    .classed("bg", true)
    .classed("bg-even", everyOdd);

  var charts = category.append("g");
  var figures = category.append("g");

  // Categories
  //
  //

  var categoryLabel = category.append("text")
    .text(function(d, i) { return d.category; })
    .attr("dx", "5px")
    .attr("dy", "20px")
    .classed("header", true);

  // Figures
  //
  //

  var bodyFigureSVG = document.getElementById('body-figure').innerHTML;

  figures.attr("transform", function(d, i) { return "translate(0, 0)"; });

  var markOrganFigures = function(bodyFigure) {
    bodyFigure.each(function(d, i) {
      var cancers = d.cancers, cancer, figure;
      for (var i = 0; i < cancers.length; ++i) {
        cancer = cancers[i];
        if (figure = this.querySelector("#" + cancer.type.toLowerCase() + " path")) {
          figure.style.fill = colorScale(i);
          figure.style.fillOpacity = opacityScale(cancer.percentage);
        }
      }

    });
  };

  var bodyFigure = figures.append("svg")
    .attr("width", graphWidthOffset)
    .attr("height", categoryHeight)
    .attr("viewBox", "0 0 745 1051")
    .html(bodyFigureSVG)
    .call(markOrganFigures);

  // Bar charts
  //
  //

  charts.attr("transform", function(d, i) { return "translate(" + graphWidthOffset + ", 0)"; })

  var rect = charts.selectAll("rect")
    .data(function(d, i) { return d.cancers;})
    .enter()
    .append("rect")
    .attr("width", barWidth)
    .attr("height", function(d, i) { return unityScale(d.percentage); })
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .attr("fill", function(d, i) { return colorScale(i); });

  var cancerTypeLabel = charts.selectAll("text");
  var cancerPercentageLabel = charts.selectAll("text");
  var cancerCountLabel = charts.selectAll("text");

  cancerTypeLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return d.type; })
    .attr("dx", "5px")
    .attr("dy", "15px")
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", barPadding + barHeight)
    .classed("type", true);

  cancerPercentageLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return percentageFormat(d.percentage); })
    .attr("dx", "5px")
    .attr("dy", "-20px")
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .classed("percent", true);

  cancerCountLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return d.count; })
    .attr("dx", "5px")
    .attr("dy", "-5px")
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .classed("count", true);

}
