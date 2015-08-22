
mc.models.barGrouped = function barGrouped(model) {

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

  model.layers.groups
    .on('merge:transition', function(model, instance) {
      return this
        .attr('transform', (d,i) => `translate(${i * instance.x2.rangeBand()},0)` );
    });

  model.layers.bars
    .on('merge:transition', function(model, instance) {
      return this
        .attr('width', instance.x2.rangeBand());
    });


  //------------------------------------------------------------



  chart.calc = function(instance, data) {

    model.barChart.calc.call(this, instance, data);

    //TODO: see if I can use dimensions in chartBase for this (maybe override domain)
    instance.x2 = d3.scale.ordinal()
      .domain(model.series_(data).map(model.seriesKey_))
      .rangeRoundBands([0, instance.x.rangeBand()]);


    this.__chart__.chart  = chart;
    this.__chart__.update = () => instance.container.call(chart);


    return chart;
  };



  chart.build = function(instance, data) {

    model.barChart.build.call(this, instance, data);


    return chart;
  };



  function chart(selection, instance) {
    selection.each(function(data) {
      instance = instance || {};

      chart.calc.call(this, instance, data);
      chart.build.call(this, instance, data);
    });

    return chart;
  }


  //============================================================
  // Expose Public API

  chart.barChart = model.barChart;

  mc.rebind(chart, model.barChart);

  //------------------------------------------------------------


  return chart;
};
