
mc.models.bar = function bar(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.xyChartBase = mc.models.xyChartBase(model); // base settings, scale calculations, and wrappers

  // Settings
  model.name        = 'bar'; // used for top level class, usually matches model name

  // Accessors

  // Setup Component Static Settings
  model.xyChartBase
    .xScale(d3.scale.ordinal()) //using ordinal in this model to make sure each bar/bar group is equal-distance apart and equal-width
    .yForce(0); // bar chart's should always force 0 so bar goes from 0 to max/min (it should be possible to override/remove this setting via chart.yForce([]) //TODO: confirm this (yForce and all other component's API's should be rebinded onto this chart)

  // Setup Layers

  model.layers  = model.layers || {};

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
          .attr('class', function(d, i) { return 'mc-group mc-group-' + i; })
          .classed('mc-disabled', function(d) { return d.disabled; });
      },
      'merge:transition': function(model, instance) {
        return this
          .attr('transform', function(d, i) { return 'translate(0,0)'; });
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-group-exit', true);
      },
      'exit:transition': function(model, instance) {
        this.selectAll('.mc-bar')
          .attr('y', instance.y(0))
          .attr('height', 0)
          .remove();
        return this.remove();
      }
    }
  });


  model.layers.bars = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('.mc-bar')
        .data(model.values_, model.pointKey_);
    },
    insert: function() {
      return this.append('rect')
        .attr('class', function(d, i) { return 'mc-bar'; });
    },
    events: {
      'enter': function(model, instance) {
        return this
          .attr('x', instance.x0Calc)
          .attr('y', instance.y0Calc)
          //TODO: investigate implementation of model.y_ and instance.y... scales MAY be shared between instances, BUT calculated for each instance when generating chart
          //      **this might be OK, tho might not.  Need to test more on chart model's with multiple instances (ie. selection of more than 1 element with same model but different data)
          .attr('y', function(d) { return model.y_.apply(this, arguments) > 0 ? instance.y0Calc.apply(this, arguments) : instance.y0(0); })
          .attr('width', instance.x.rangeBand())
          .attr('height', function() {
            return Math.abs(instance.y0Calc.apply(this, arguments) - instance.y0(0));
          });
      },
      'merge': function(model, instance) {
        return this
          .attr('class', (d, i) => 'mc-bar mc-bar-' + i);
      },
      'merge:transition': function(model, instance) {
        return this
          .attr('x', instance.xCalc)
          .attr('y', function(d) { return model.y_.apply(this, arguments) > 0 ? instance.yCalc.apply(this, arguments) : instance.y(0); })
          .attr('width', instance.x.rangeBand())
          .attr('height', function() {
            return Math.abs(instance.yCalc.apply(this, arguments) - instance.y(0));
          });
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-bar-exit', true);
      },
      'exit:transition': function(model, instance) {
        return this
          .attr('y', instance.y(0))
          .attr('height', 0)
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

    model.xyChartBase
      .xRangeBands((model,instance) => [ [0, instance.width] , .1 ] );

    model.xyChartBase.calc.call(this, instance, data);


    //TODO: see if __chart__ keys/values can/should only go in chart.calc calls
    //      **consider placement based on parent chart overriding __chart__ values
    //      **remember that __chart__.dimension is used to store old dimension from last call
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


    //TODO: consider consistent naming... chart.build vs layer.draw ? ... chart.calc vs layer.dataBind (maybe not this one?)
    // while 'data' is passed in here and below, still using data bound to selection element, and d3 'trickling down' (THE D3 WAY)
    instance.groups = model.layers.groups.draw(instance.g.select('.mc-groups'), model, instance, data);
    instance.bars   = model.layers.bars  .draw(instance.groups, model, instance, data);

    //------------------------------------------------------------

    return chart;
  };


  //============================================================
  // Expose Public API

  mc.rebind(chart, model.xyChartBase);

  //TODO: figure out a way to not need this
  chart.rebind = function() {
    mc.rebind(chart, model.xyChartBase);
    return chart;
  };

  //------------------------------------------------------------


  return chart;
};
