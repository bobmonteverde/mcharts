
mc.models.line = function line(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.xyChartBase = mc.models.xyChartBase(model); // base settings, scale calculations, and wrappers
  //TODO: overlay scatter for interaction and display of points

  // Settings
  model.name        = 'line'; // used for top level class, usually matches model name

  // Accessors
  model.defined_    = d => !d.notDefined;

  // Setup Layers
  //TODO: consider making in chart.layers not model.layers

  model.layers = model.layers || {};

  model.layers.groups = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('.mc-group')
        .data(model.series_, model.seriesKey_);
    },
    insert: function() {
      return this.append('g')
        .classed('mc-group', true);
    },
    events: {
      'merge': function(model, instance) {
        return this
          .attr('class', (d, i) => `mc-group mc-group-${i}`)
          .classed('mc-disabled', d => d.disabled);
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-group-exit', true);
      },
      //TODO: put remove here instead of in exit to allow other models to utilize an exit transition
      'exit:transition': function(model, instance) {
        return this.remove();
      }
    }
  });


  model.layers.lines = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('.mc-path')
        .data(function() { return [model.values_.apply(this, arguments)]; });
    },
    insert: function() {
      return this.append('path')
        //.attr('class', function(d, i) { return 'mc-path'; });
        .attr('class', 'mc-path');
    },
    events: {
      'enter': function(model, instance) {
        return this
          .attr('d',
            d3.svg.line()
              //.interpolate(interpolate)
              .defined(model.defined_)
              .x(instance.x0Calc)
              .y(instance.y0Calc)
          );
      },
      'merge': function(model, instance) {
        return this
          .attr('class', (d, i) => `mc-path mc-path-${i}` );
      },
      'merge:transition': function(model, instance) {
        return this
          .attr('d',
            d3.svg.line()
              //.interpolate(interpolate)
              .defined(model.defined_)
              .x(instance.xCalc)
              .y(instance.yCalc)
          );
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-path-exit', true);
      },
      'exit:transition': function(model, instance) {
        return this
          .attr('d',
            d3.svg.line()
              //.interpolate(interpolate)
              .defined(model.defined_)
              .x(instance.xCalc)
              .y(instance.yCalc)
          )
          .remove();
      }
    }
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
    model.xyChartBase.calc.call(this, instance, data);


    this.__chart__.chart    = chart;
    this.__chart__.update   = () => instance.container.call(chart);

    return chart;
  };


  chart.build = function(instance, data) {
    model.xyChartBase.build.call(this, instance, data);

    //------------------------------------------------------------
    // Setup Chart Layers

    instance.gEnter.append('g').attr('class', 'mc-groups');

    //------------------------------------------------------------


    //------------------------------------------------------------
    // Core Chart Code

    instance.groups = model.layers.groups.draw(instance.g.select('.mc-groups'), model, instance, data);
    instance.lines  = model.layers.lines .draw(instance.groups, model, instance, data);

    //------------------------------------------------------------

    return chart;
  };


  //============================================================
  // Expose Public API

  mc.rebind(chart, model.xyChartBase);


  chart.defined = function(_) {
    if (!arguments.length) return model.defined_;
    model.defined_ = _;
    return chart;
  };

  //TODO: figure out a way to not need this
  chart.rebind = function() {
    mc.rebind(chart, model.xyChartBase);
    return chart;
  };

  //------------------------------------------------------------


  return chart;
};
