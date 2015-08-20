
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
      , some: 'random'
      , testing: 'text'
      });
    }
  }

  return data;
}

mc.render(function() {
  var chart = mc.models.scatter(),
      chartWrap1 = d3.select('#example1'),
      chartWrap2 = d3.select('#example2');

  chart
    .renderAxes(true)
    .renderLegend(true)
    .renderVoronoi(true)
    .rebind()
    .bottomLabel('Bottom Axis')
    .leftLabel('Left Axis')
    .rightLabel('Right Axis')
    .topLabel('Top Axis')
    //.xForce([-1,2])
    //.xDomain([-4,4])
    //.xScale(d3.scale.pow().exponent(2))
    //.yScale(d3.scale.pow().exponent(2))
    //.renderBottom(false)
    //.renderLeft(false)
    //.renderTop(true)
    //.renderRight(true)
    //.colorUse(true)
    //.color(function(d,i,j) { return typeof j === 'undefined' ? i : j; })
    .margin({top: 40, right: 60, bottom: 30, left: 50});

  //chart.leftTicks([20])

  //chart.chartBase.leftAxis
    //.ticks(3);
  //chart.chartBase.bottomAxis
    //.ticks(6);

  var update = function() {
    // Due to data being generated on the fly, render time in example may be higher than real render time
    chartWrap1
        .datum(getData(Math.round(Math.random()) + 3, Math.round(Math.random() * 20) + 20))
      .transition().duration(2000)
        .call(chart);

    chartWrap2
        .datum(getData(Math.round(Math.random()) + 3, Math.round(Math.random() * 20) + 20))
      .transition().duration(2000)
        .call(chart);

    return;
    chartWrap1.chart().dispatch.on('click', function(d, i, j) {
      mc.log('click', this, d, i, j)
    });
    chartWrap1.chart().dispatch.on('dblclick', function(d, i, j) {
      mc.log('dblclick', this, d, i, j)
    });
    chartWrap1.chart().dispatch.on('mouseover', function(d, i, j) {
      mc.log('mouseover', this, d, i, j)
    });
    chartWrap1.chart().dispatch.on('mouseout', function(d, i, j) {
      mc.log('mouseout', this, d, i, j)
    });
  }

  update();

  // For Testing in console
  window.chartWrap1 = chartWrap1
  window.chart = chart;
  window.update = update;

  d3.select('#update').on('click', update);

  return chart;
});
