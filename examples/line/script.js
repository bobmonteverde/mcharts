
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

  return [{values: data, key: 'Sine' }];
}


function data() {
  return stream_layers(3,100,.1).map(function(data, i) {
  //return stream_layers(3,10+Math.random()*200,.1).map(function(data, i) {
    return {
      key: 'Stream' + i,
      values: data
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
  var chart = mc.models.line(),
      chartWrap1 = d3.select('#example1'),
      chartWrap2 = d3.select('#example2');

  chart
    .renderAxes(true)
    .renderLegend(true)
    .rebind()
    .margin({top: 30, right: 60, bottom: 30, left: 50})
    //.yForce([12])
    //.xDomain([-4,4])


  var update = function() {
    // Due to data being generated on the fly, render time in example may be higher than real render time
    chartWrap1
        .datum(data())
      .transition().duration(2000)
        .call(chart);

    chartWrap2
        .datum(data())
      .transition().duration(2000)
        .call(chart);

  }

  update();

  d3.select('#update').on('click', update);

  return chart;
});


mc.render(function() {
  var chart = mc.models.line(),
      chartWrap3 = d3.select('#example3');

  chart
    .renderAxes(true)
    .renderLegend(true)
    .rebind()
    .margin({top: 30, right: 60, bottom: 30, left: 50})
    //.values(function(d){ return d })
    .xScale(d3.time.scale())
    .yDomain([-1,1])
    //.yForce([12])
    //.xDomain([-4,4])


  var update = function(d) {
    // Due to data being generated on the fly, render time in example may be higher than real render time
    chartWrap3
        .datum(d)
      .transition().duration(500)
        .call(chart);
  }

  update(sinData());

  setInterval(function() {
      update(sinData());
  }, 500);

  return chart;
});
