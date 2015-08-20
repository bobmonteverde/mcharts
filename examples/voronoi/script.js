
function getData(groups, points) {
  var data = [],
      //shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
      random = d3.random.normal(),
      randomX = Math.random(),
      randomY = Math.random();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        x: random() * randomX
      , y: random() * randomY
      , size: Math.random()
      //, shape: shapes[j % 6]
      });
    }
  }

  return data;
}

mc.render(function() {
  var chart = mc.models.voronoi(),
      chartWrap = d3.select('#example');

  chart
    .margin({top: 20, right: 20, bottom: 30, left: 50})
    .clipTiles(false)
    .renderLegend(true)
    //.useColor(true)
    //.color(function(d,i,j) { return typeof j === 'undefined' ? i : j; })

  var update = function() {
    // Due to data being generated on the fly, render time in example may be higher than real render time
    chartWrap
        .datum(getData(Math.round(Math.random()) + 3, Math.round(Math.random() * 20) + 20))
      //.transition().duration(2000)
        .call(chart)
  }

  update();

  // For Testing in console
  window.chartWrap = chartWrap
  window.chart = chart;
  window.update = update;

  d3.select('#update').on('click', update);

  return chart;
});

