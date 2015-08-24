
//TODO: consider adding axes, or making xyAxesBase
//      **I think all xy charts will likely have axes
mc.models.xyBase = function xyBase(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.svgBase = mc.models.svgBase(model);

  // Settings
  model.name    = 'xyBase';

  // Accessors

  // Setup Component Settings
  model.svgBase
    .dimension({
      key:   'x',
      range: (model, instance) => [0, instance.width]
    })
    .dimension({
      key:   'y',
      range: (model, instance) => [instance.height, 0]
    });
    //.dimension({
      //key: 'color',
      //scale: d3.scale.category10(), //TODO: color in this case might be a linear scale, not an ordinal... for gradient
      //disable: true
    //});

  //this is required because of the dimensions being added to chartBase after the original mc.rebind
  //TODO: consider naming a uniqueRebind to just rebind the new chart.dim*
  //TODO: consider moving dimensions outside of chart model, maybe into core or more utils
  mc.rebind(model.svgBase, model.chartBase);

  //------------------------------------------------------------


  //TODO: this appears to be identical in all charts, should see if there is a way to automate this
  function chart(selection, instance) {
    selection.each(function(data) {
      instance = instance || {};

      chart.calc.call(this, instance, data);
      chart.build.call(this, instance, data);
    });

    return chart;
  }


  chart.calc = function(instance, data) {
    model.svgBase.calc.call(this, instance, data);

    return chart;
  };


  chart.build = function(instance, data) {
    model.svgBase.build.call(this, instance, data); // This currently DOES NOTHING, but here incase someting is added

    //------------------------------------------------------------
    // Setup Chart Layers

    //------------------------------------------------------------

    //TODO: consider implementing optional chart clipping mask

    return chart;
  };


  //============================================================
  // Expose Public API

  mc.rebind(chart, model.svgBase);

  //------------------------------------------------------------


  return chart;
};
