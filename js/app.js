var data;

d3.json("assets/data/cancer_counts.json", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  main();
});

main = function() {
  var svg = document.getElementById('svg-container');

  var width = svg.clientWidth,
    height = document.body.clientHeight - 10,

    padding = 0.1;
    paddedWidth = width * (1 - padding);
    paddingWidth  = width * (padding) * 0.5;

    graphWidth = (paddedWidth * 0.5);
    graphWidthOffset = paddedWidth - graphWidth;

    barWidth = graphWidth / Math.max.apply(null, data.map(function(d, i) { return d.cancers.length; }));
    barShrinkage = 0.66;
    barShrinkageComplement = 1 - barShrinkage;

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

  var unityScaleInv = d3.scale.linear()
    .domain([0, maxPercent])
    .range([barHeight, 0]);

  var opacityScale = d3.scale.pow()
    .domain([0, maxPercent])
    .range([0, 1]);

  var colorScale = d3.scale.ordinal()
    .range(colorbrewer.Greys[numCancers] || colorbrewer.Greys[3]);

  var everyOdd = function(d, i){ return i % 2; };

  var percentageFormat = d3.format("3.1%");

  var percentageFormatWhole = d3.format("3%");

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
    .attr("class", "bg")
    .classed("bg-even", everyOdd);

  var charts = category.append("g");
  var figures = category.append("g");

  // Categories
  //
  //

  var categoryLabel = category.append("text")
    .text(function(d, i) { return d.category; })
    .attr("dx", paddingWidth)
    .attr("dy", "40px")
    .attr("class", "header");

  // Figures
  //
  //

  var bodyFigureSVG = document.getElementById('body-figure').innerHTML;

  figures.attr("transform", function(d, i) { return "translate(" + paddingWidth + ", 0)"; });

  var markOrganFigures = function(bodyFigure) {
    bodyFigure.each(function(d, i) {
      var cancers = d.cancers, cancer, figure;
      for (var i = 0; i < cancers.length; ++i) {
        cancer = cancers[i];
        if (figure = this.querySelector("#" + cancer.type.toLowerCase() + " path")) {
          figure.style.fill = "white";
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

  charts.attr("transform", function(d, i) { return "translate(" + (paddingWidth + graphWidthOffset) + ", 0)"; })

  var yAxis = charts.append("g")
    .attr("transform", "translate(0, " + barPadding + ")")
    .attr("class", "axis")
    .call(
      d3.svg.axis()
      .scale(unityScaleInv)
      .orient("left")
      .tickFormat(percentageFormatWhole)
      .ticks(5)
      .tickSize(-graphWidth)
    );

  var rect = charts.append("g").selectAll("rect")
    .data(function(d, i) { return d.cancers; })
    .enter()
    .append("rect")
    .attr("width", barWidth * barShrinkage)
    .attr("height", function(d, i) { return unityScale(d.percentage); })
    .attr("x", function(d, i) { return (i + barShrinkageComplement * 0.5) * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .attr("fill", function(d, i) { return colorScale(i); });

  var cancerTypeLabel = charts.append("g").selectAll("text");
  var cancerPercentageLabel = charts.append("g").selectAll("text");
  var cancerCountLabel = charts.append("g").selectAll("text");

  cancerTypeLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return d.type; })
    .attr("dx", barWidth * barShrinkageComplement * 0.5)
    .attr("dy", 15)
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", barPadding + barHeight)
    .attr("class", "type");

  cancerPercentageLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return percentageFormat(d.percentage); })
    .attr("dx", barWidth * barShrinkageComplement * 0.5)
    .attr("dy", "-20px")
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .attr("class", "percent");

  cancerCountLabel.data(function(d, i) { return d.cancers; })
    .enter()
    .append("text")
    .text(function(d, i) { return d.count; })
    .attr("dx", barWidth * barShrinkageComplement * 0.5)
    .attr("dy", "-5px")
    .attr("x", function(d, i) { return i * barWidth; })
    .attr("y", function(d, i) { return barPadding + barHeight - unityScale(d.percentage); })
    .attr("class", "count");

  var baseline = charts.append("g").append("line")
    .attr("x1", 0)
    .attr("x2", function(d, i) { return graphWidth; })
    .attr("y1", barPadding + barHeight)
    .attr("y2", barPadding + barHeight)
    .attr("class", "tick-line baseline");
}
