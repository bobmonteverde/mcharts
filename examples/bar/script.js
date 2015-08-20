var now = new Date();

function sinData() {
  var data = [];

  now = new Date(now.getTime() + 500);

  for (var i = 0; i < 75; i++) {
    data.push({
      x: new Date(now.getTime() + i * 500),
      y: Math.sin((now.getTime() + i * 500)/5000)
    });
  }

  return [data];
}


function data(n, posOnly) {
  return stream_layers(n || 1,10,.1).map(function(data, i) {
  //return stream_layers(3,10+Math.random()*200,.1).map(function(data, i) {
    return {
      key: 'Stream' + i,
      values: data.map(function(d) {
            d.y = (posOnly ? 1 : (Math.random() - .5)) * d.y;
            return d;
          })
    };
  });
}

/* Inspired by Lee Byron's test data generator. */
function stream_layers(n, m, o) {
  if (arguments.length < 3) o = 0;
  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < m; i++) {
      var w = (i / m - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }
  return d3.range(n).map(function() {
      var a = [], i;
      for (i = 0; i < m; i++) a[i] = o + o * Math.random();
      for (i = 0; i < 5; i++) bump(a);
      return a.map(stream_index);
    });
}

/* Another layer generator using gamma distributions. */
function stream_waves(n, m) {
  return d3.range(n).map(function(i) {
    return d3.range(m).map(function(j) {
        var x = 20 * j / m - i / 3;
        return 2 * x * Math.exp(-.5 * x);
      }).map(stream_index);
    });
}

function stream_index(d, i) {
  return {x: i, y: Math.max(0, d)};
}


mc.render(function() {
  var chart  = mc.models.bar(),
      chart2 = mc.models.barGrouped(),
      chart3 = mc.models.barStacked(),
      chartWrap1  = d3.select('#example1'),
      chartWrap1b = d3.select('#example1b'),
      chartWraps1 = d3.selectAll('.example1'),
      chartWrap1  = d3.select('#example1'),
      chartWrap2  = d3.select('#example2'),
      chartWrap3  = d3.select('#example3'),
      chartWrap4  = d3.select('#example4')
      ;

  var i = 0;

  chart
    .margin({top: 40, right: 10, bottom: 10, left: 60})
    //.renderLeft(true) //default
    .renderAxes(true)
    .renderLegend(true)
    .rebind()
    .leftLabel('distance (cm)')
    .renderTop(true)
    .topLabel('group id (#)')
    //.legendVerticalAlign('top')
    //.renderRight(false) //default
    .renderBottom(false)

  //TODO: mc.rebind doesn't make components available
  //chart.legend
    //.height(40)

  chart2
    .margin({top: 40, right: 10, bottom: 30, left: 60})
    .renderAxes(true)
    .renderLegend(true)
    .rebind()
    //.renderRight(true)
    //.renderTop(true)
    //.renderLeft(false)
    //.renderBottom(false)

  chart3
    .margin({top: 40, right: 10, bottom: 30, left: 60})
    .renderAxes(true)
    .renderLegend(true)
    .rebind()

  // **udate() is used both for initial generating of charts as well as updating
  //   the charts with new data AND rotating bar models (chartWrap4)
  var update = function() {
    // Due to data being generated on the fly, render time in example may be higher than real render time
    chartWrap1
        .datum(data(1))

    chartWrap1b
        .datum(data(1))

    // **This is to demonstrate selection.each inside chart() functionality
    //     Multiple chart instances are generated from single chart settup
    //     and single call on a selectAll selection of all instances
    //     * data is unique, so set individually above
    chartWraps1
      .transition().duration(2000)
        .call(chart);

    chartWrap2
        .datum(data(Math.ceil(Math.random() * 3)))
      .transition().duration(2000)
        .call(chart2);

    chartWrap3
        //.datum(data(3, true))
        .datum(data(Math.ceil(Math.random() * 3), true))
      .transition().duration(2000)
        .call(chart3);

    // **chartWrap4 is to demonstrate 2 things:
    //   --it uses chart models previously used above on different instances
    //   --it shows transtioning smoothly between different models with the
    //     same elements arranged differently (barGrouped and barStacked)
    //     * both based off bar model with different layout calculation and
    //       tweaked Layers
    if (!i)
      chartWrap4
          .datum(data(3, true))
        .transition().duration(2000)
          .call(chart3);
    else
      chartWrap4
        .transition().duration(2000)
          .call(i % 2 ? chart2 : chart3);

    i++;
  }

  update();

  d3.select('#update').on('click', update);

  return chart;
});
