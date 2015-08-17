
mc.models.scatter = function scatter(model) {

  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.xyChartBase   = mc.models.xyChartBase(model); // base settings, scale calculations, and wrappers
  //TODO: consider making a tooltip component similar to chartBase or axes, or some other way to help reuse

  // Settings
  model.name          = 'scatter'; // used for top level class, usually matches model name
  model.renderVoronoi = false;      // toggle to use voronoi or direct mouse interaction of points
  model.useTooltip    = true;      // toggle to use tooltips
  model.tooltipParent = null;      // DOM element that the tooltip will be appended to ***this is required to be set if container.parentNode is SVG (not HTML)

  // Accessors
  model.tooltip_      = function getTooltip(d, i, j) {
                          var format = d3.format(',.2r');
                          return '<span class="mc-tooltip-x">' + format(model.x_.apply(this, arguments)) + ':&nbsp;</span>' +
                                 '<span class="mc-tooltip-y">' + format(model.y_.apply(this, arguments)) + '</span>';
                        };



  // Setup Component Static Settings
  model.xyChartBase
    //TODO: may need to do a mc.rebind because the dimesion is added
    .dimension({key: 'size', range: [4, 16]}) //TODO: consider using pow scale instead of linear for area from radius
    ;

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
      'enter': function(model, instance) {
        return this
          //.style('fill',   instance.color0Calc)  //TODO: maybe use chart.colorUse as toggle for this
          //.style('stroke', instance.color0Calc);
      },
      'merge': function(model, instance) {
        return this
          .attr('class', function(d,i) { return 'mc-group mc-group-' + i })
          .classed('mc-disabled', function(d) { return d.disabled });
      },
      'merge:transition': function(model, instance) {
        return this
          //.style('fill',   instance.colorCalc)
          //.style('stroke', instance.colorCalc)
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-group-exit', true);
      },
      //TODO: put remove here instead of in exit to allow other models to utilize an exit transition
      //      **maybe just put it in exit, and have the event be overrided to animate exit
      'exit:transition': function(model, instance) {
        return this.remove();
      }
    }
  });


  model.layers.points = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('.mc-point')
        .data(model.values_, model.pointKey_);
    },
    insert: function() {
      return this.append('circle')
        .classed('mc-point', true);
    },
    events: {
      'enter': function(model, instance) {
        return this
          .attr('r',  instance.size0Calc)
          .attr('cx', instance.x0Calc)
          .attr('cy', instance.y0Calc)
          //.style('fill',   instance.color0Calc)
          //.style('stroke', instance.color0Calc)
          //TODO: Decide if events should go here, or just in chart.build
          .on('click',     instance.dispatch.click)
          .on('dblclick',  instance.dispatch.dblclick)
          .on('mouseover', instance.dispatch.mouseover)
          .on('mouseout',  instance.dispatch.mouseout);
      },
      'merge': function(model, instance) {
        return this
          .attr('class', function(d, i) { return 'mc-point mc-point-' + i });
      },
      'merge:transition': function(model, instance) {
        return this
          .attr('r',  instance.sizeCalc)
          .attr('cx', instance.xCalc)
          .attr('cy', instance.yCalc)
          //.style('fill',   instance.colorCalc)
          //.style('stroke', instance.colorCalc)
      },
      'exit': function(model, instance) {
        return this
          .classed('mc-point-exit', true);
      },
      'exit:transition': function(model, instance) {
        return this
          .attr('r',  instance.sizeCalc)
          .attr('cx', instance.xCalc)
          .attr('cy', instance.yCalc)
          .remove();
      }
    }
  });

  //------------------------------------------------------------


  chart.calc = function(instance, data) {

    model.xyChartBase.calc.call(this, instance, data);

    instance.dispatch = this.__chart__.dispatch || d3.dispatch(
                                            'click'
                                          , 'dblclick'
                                          , 'mouseover'
                                          , 'mouseout'
                                          );

    this.__chart__.chart    = chart;
    this.__chart__.update   = function() { return instance.container.call(chart) };
    this.__chart__.dispatch = instance.dispatch;

    return chart;
  };


  chart.build = function(instance, data) {

    model.xyChartBase.build.call(this, instance, data);

    //------------------------------------------------------------
    // Setup Chart Layers

    instance.gEnter.append('g').attr('class', 'mc-groups');
    instance.gEnter.append('g').attr('class', 'mc-voronoi-wrap');

    //------------------------------------------------------------

    //------------------------------------------------------------
    // Core Chart Code

    instance.groups = model.layers.groups.draw(instance.g.select('.mc-groups'), model, instance, data);
    instance.points = model.layers.points.draw(instance.groups, model, instance, data);


    if (model.renderVoronoi) {
      // TODO: decide if the setup should be in chart.calc.
      //     **also potentially have voronoi.calc called in this chart.calc, then voronoi.build here
      model.voronoi
        .series(model.series_)
        .values(model.values_)
        .x(model.x_)
        .y(model.y_)
        .xScale(instance.x)
        .yScale(instance.y)
        .width(instance.width)
        .height(instance.height);

      instance.voronoiWrap = instance.g.select('.mc-voronoi-wrap');

      instance.voronoiWrap.call(model.voronoi);

      instance.voronoiWrap.chart().dispatch.on('click.pointClick', pointClick);
      instance.voronoiWrap.chart().dispatch.on('dblclick.pointDblClick', pointDblClick);
      instance.voronoiWrap.chart().dispatch.on('mouseover.pointMouseover', pointMouseover);
      instance.voronoiWrap.chart().dispatch.on('mouseout.pointMouseout', pointMouseout);
    }


    if (model.renderLegend) {
      instance.legendWrap.chart().dispatch.on('mouseover.hoverSeries', hoverSeries);
      instance.legendWrap.chart().dispatch.on('mouseout.unhoverSeries', unhoverSeries);
    }

    //------------------------------------------------------------

    //TODO: need to bind events on circles when not using voronoi
    function pointClick(d, i, j) {
      var point = instance.g.select('.mc-group-' + j + ' .mc-point-' + i);
      instance.dispatch.click.apply(point.node(), arguments);
    }

    function pointDblClick(d, i, j) {
      var point = instance.g.select('.mc-group-' + j + ' .mc-point-' + i);
      instance.dispatch.dblclick.apply(point.node(), arguments);
    }

    function pointMouseover(d, i, j) {
      var point = instance.g.select('.mc-group-' + j + ' .mc-point-' + i);
      clearHover();
      hideTooltip();
      showTooltip.apply(this, arguments);
      point.classed('mc-hover', true);
      instance.dispatch.mouseover.apply(point.node(), arguments);
    }

    function pointMouseout(d, i, j) {
      var point = instance.g.select('.mc-group-' + j + ' .mc-point-' + i);
      clearHover();
      hideTooltip();
      instance.dispatch.mouseout.apply(point.node(), arguments);
    }

    function clearHover() {
      instance.g.select('.mc-point.mc-hover')
          .classed('mc-hover', false);
    }


    function showTooltip(d, i, j) {
      if (!model.useTooltip) return;

      var left = instance.xCalc.apply(this, arguments) + model.margin.left
        , top =  instance.yCalc.apply(this, arguments) + model.margin.top
        ;

      mc.tooltip.show({
        pos: [left, top]
      , content: model.tooltip_.apply(this, arguments)
      , gravity: 's'
      , dist: 20
      , parent: model.tooltipParent || instance.container.node().parentNode //TODO: default only works if container is SVG element and parentNode is HTML
      })
    }

    function hideTooltip() {
      if (!model.useTooltip) return;
      mc.tooltip.cleanup();
    }


    function hoverSeries(d) {
      d.series.hover = true;

      //TODO: consider not setting this class when series is disabled
      instance.g.select('.mc-groups')
          .classed('mc-groupHover', true);
      instance.groups
          .classed('mc-hover', function(d) { return d.hover });
    }

    function unhoverSeries(d) {
      d.series.hover = false;

      instance.g.select('.mc-groups')
          .classed('mc-groupHover', false);
      instance.groups
        .classed('mc-hover', false); //TODO: maybe do same as hoverSeries, incase mouse is already over another
    }


    //------------------------------------------------------------

    return chart;
  }



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


  mc.rebind(chart, model.xyChartBase);


  chart.renderVoronoi = function(_) {
    if (!arguments.length) return model.renderVoronoi;
    model.renderVoronoi = _;

    if(_) {
      model.voronoi = mc.models.voronoi(); // voronoi layer for advanced mouse interaction
      model.voronoi
        //.margin({top: 0, right: 0, bottom: 0, left: 0}) // defaults anyway
        .calcScales(false)
        .clipTiles(true)
        .renderLegend(false)
        .renderAxes(false);

      d3.rebind(chart, model.voronoi, 'clipRadius', 'clipTiles');
      chart.voronoi = model.voronoi; //TODO: decide if this should/needs to be public (rebinding all needed options directly onto chart already?) .... I think this can be removed
    }

    return chart;
  };

  chart.tooltip = function(_) {
    if (!arguments.length) return model.tooltip_;
    model.tooltip_ = _;
    return chart;
  };

  chart.useTooltip = function(_) {
    if (!arguments.length) return model.useTooltip;
    model.useTooltip = _;
    return chart;
  };

  chart.tooltipParent = function(_) {
    if (!arguments.length) return model.tooltipParent;
    model.tooltipParent = _;
    return chart;
  };

  //TODO: figure out a way to not need this
  chart.rebind = function() {
    mc.rebind(chart, model.xyChartBase);
    return chart;
  }

  //------------------------------------------------------------


  return chart;
};
