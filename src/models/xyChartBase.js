
mc.models.xyChartBase = function xyChartBase(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.xyBase       = mc.models.xyBase(model);

  // Settings
  model.name         = 'xyChartBase';
  model.renderLegend = false;
  model.renderAxes   = false;

  // Accessors

  // Setup Component Settings

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
    model.xyBase.calc.call(this, instance, data);

    return chart;
  };


  chart.build = function(instance, data) {
    model.xyBase.build.call(this, instance, data); // This currently DOES NOTHING, but here incase someting is added

    //------------------------------------------------------------
    // Setup Chart Layers

    //TODO: deside on not rendering this is renderAxes/renderVoronoi false **this would prevent turning Axes back on (b/c gEnter) BUT if they are on, you can't currently turn them off anyway
    instance.gEnter.append('g').attr('class', 'mc-axes-wrap');
    //TODO: figure out best way to put legend on top of parent chart's layers
    instance.gEnter.append('g').attr('class', 'mc-legend-wrap');

    //------------------------------------------------------------

    //------------------------------------------------------------
    // Core Chart Code

    function toggleDisabled(d) {
      d.series.disabled = !d.series.disabled;

      //TODO: maybe haave the parent chart update itself?
      //TODO: consider dispatching event toggleDisable
      //TODO: **consider making a dispatch that multiple inherited charts can share
      instance.container.chart().update();
    }


    if (model.renderAxes) {
      instance.axesWrap = instance.g.select('.mc-axes-wrap');
      model.axes(instance.axesWrap, instance);
    }


    //TODO: create a legend wrapper chart to allow easy positioning of legend
    //      around the edged (inside and outside) of chart borders
    if (model.renderLegend) {
      instance.legendWrap = instance.g.select('.mc-legend-wrap')
        .attr('transform', 'translate(0,-20)');

      //TODO: legend width and height are not able to be set in parent charts
      model.legend
        .width(instance.width)
        .height(20);

      model.legend(instance.legendWrap);


      instance.legendWrap.chart().dispatch.on('click.toggleDisabled', toggleDisabled);
    }

    //------------------------------------------------------------

    return chart;
  };


  //============================================================
  // Expose Public API


  mc.rebind(chart, model.xyBase);


  chart.renderLegend = function(_) {
    if (!arguments.length) return model.renderLegend;
    model.renderLegend = _;

    if (_) {
      model.legend = mc.models.legend(); //TODO: decide if 'model' can/should be passed in (also debate on same thing with axes)
      model.legend
        .legendLabelWidth(85)
        .legendLabelHeight(20)
        .legendHorizontalAlign('right');

      d3.rebind(chart, model.legend, 'legendOrientation', 'legendHorizontalAlign', 'legendVerticalAlign', 'legendShape', 'legendLabelWidth', 'legendLabelHeight');
      //chart.legend = model.legend;
    }

    return chart;
  };

  chart.renderAxes = function(_) {
    if (!arguments.length) return model.renderAxes;
    model.renderAxes = _;

    if (_) {
      model.axes = mc.models.axes(model);      // chart axes
      mc.rebind(chart, model.axes);  //TODO: see if this works with o.axes.*Axis being directly on th chart
      //TODO: this rebinds to xyChartBase, not parent chart!.. figure out best way to handle this (currently need to call chart.rebind on parent)
    }

    return chart;
  };

  //------------------------------------------------------------


  return chart;
};
