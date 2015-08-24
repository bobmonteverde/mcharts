
mc.models.barStacked = function barStacked(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.barChart = mc.models.bar(model); // base off bar model

  // Settings

  // Accessors

  // Setup Component Static Settings

  // Setup Layers

  // Modify Component Layers

  model.layers.bars
    .on('enter', function(model, instance) {
      return this
        .attr('y', d => instance.y0(d.y + d.y0))
        .attr('height', function() {
          return Math.abs(instance.y0Calc.apply(this, arguments) - instance.y(0));
        });
    })

    .on('merge:transition', function(model, instance) {
      return this
        .attr('y', d => instance.y(d.y + d.y0))
        .attr('height', function() {
          return Math.abs(instance.yCalc.apply(this, arguments) - instance.y(0));
        });
    });

  //------------------------------------------------------------


  function chart(selection, instance) {
    selection.each(function(data) {
      instance = instance || {};

      chart.calc.call(this, instance, data);
      chart.build.call(this, instance, data);
    });

    return chart;
  }


  chart.calc = function(instance, data) {
    instance.stack = d3.layout.stack()
      .values(model.values_)
      .x(model.x_)
      .y(model.y_);

    //TODO: should be using chart.series_
    instance.stack(
      data.filter(d => !d.disabled)
    );

    //TODO: currently positive only y values... consider stacking postivies, stacking negatives, then combining
    model.barChart.yForce([0,
                           d3.max(
                             model
                               .series_(data)
                               .filter(d => !d.disabled)
                               .map(model.values_)
                               .pop() //Only need to check last series for stacked max
                               .map(d => d.y + d.y0)
                           )
                          ]);


    model.barChart.calc.call(this, instance, data);


    this.__chart__.chart  = chart;
    this.__chart__.update = () => instance.container.call(chart);


    return chart;
  };


  chart.build = function(instance, data) {
    model.barChart.build.call(this, instance, data);

    return chart;
  };


  //============================================================
  // Expose Public API

  chart.barChart = model.barChart;

  mc.rebind(chart, model.barChart);

  //------------------------------------------------------------


  return chart;
};
