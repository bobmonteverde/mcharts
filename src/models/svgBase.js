
mc.models.svgBase = function svgBase(model) {

  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.chartBase = mc.models.chartBase(model);

  // Settings
  model.name      = 'svgBase';

  // Accessors

  // Setup Component Settings

  //------------------------------------------------------------



  chart.calc = function(instance, data) {

    model.chartBase.calc.call(this, instance, data);

    return chart;
  };



  chart.build = function(instance, data) {

    model.chartBase.build.call(this, instance, data); // This currently DOES NOTHING, but here incase someting is added

    //------------------------------------------------------------
    // Setup Chart Layers

    instance.wrap      = instance.container.selectAll('g.mc-' + model.name).data([data]);
    instance.wrapEnter = instance.wrap.enter().append('g').attr('class', 'mc-' + model.name);
    instance.defsEnter = instance.wrapEnter.append('defs');  //TODO: consider making this optional
    instance.defs      = instance.wrap.select('defs');
    instance.gEnter    = instance.wrapEnter.append('g');
    instance.g         = instance.wrap.select('g');

    instance.wrap.attr('transform', 'translate(' + model.margin.left + ',' + model.margin.top + ')');

    //------------------------------------------------------------


    //TODO: consider implementing optional chart clipping mask


    return chart;
  };


  //TODO: this appears to be identical in all charts, should see if there is a way to automate this
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

  mc.rebind(chart, model.chartBase);

  //------------------------------------------------------------


  return chart;
};
