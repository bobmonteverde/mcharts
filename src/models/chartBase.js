/*
 * CHART ORGANIZATION:
 *
 * 'chart' object/closure
 *   All key's on the object are external API used to override default's on 'model' object
 *   ** calling chart.key() (no arguments) get's the corrent value from 'model' object
 *   ** calling chart.key(setting) is used to override default setting on 'model' object
 *   ** chart.calc and chart.build are reserved functions
 *     --chart.calc   perform's chart's, and component's, calculations of scales and layouts (can be called again after chart's data or settings change)
 *     --chart.build  generates chart's elements OR update's previously generated chart that has changed
 *   chart() closure is called on a d3 selection with data bound to it
 *     --shorthand to call chart.calc() then chart.build()
 *       ** user does not call calc/build directly (usually) those of for being used as components of a mroe complex parent chart
 *     ex. d3.select('svg.chartContainer').data(dataObject).call(chart)
 *       ** where chart = mc.models.chartModel()
 *   ** chart() call, among chart.setting(...) call's all return 'chart' object to allow chaining of settings and calling
 *
 * 'model' object
 *   All key's on 'model' (chart settings) are technically private, but can usually be changed by accessor's on 'chart' object/closure
 *   ** if key on 'model' is not accessible from chart.getter/setter it is PRIVATE and likely constant, or used to store value from chart calc/build //TODO: chart.calc/build should NOT modify model values at all (aside from tweaking model.layer ?? (maybe this isn't true either)... Is there a point for something on model being private at all???
 *   ** model.layers is object for storing chart layer's before calling
 *   ** model.dimensions in chartBase model are a convenient way for creating scales and automatically calculating from chart's data //TODO: consider making dimensions mCharts core functioinality like layer is, instead of part of chartBase
 *   ** 'model' is shared by ALL instances (selection can be mroe than 1 element to generate multiple charts from same model with same settings)
 *     -- while it SHOULD be possible to generate multiple instances from one chart model, it's more common to generate a single instance (but you SHOULD be able to do multiple instances at once)
 *       ** for one-off complex charts that are unique, it may be easier to assume and only allow a single instance (single element in selection) but these are MUCH less reusable then
 *   ** 'model' object can be passed to chart component's (mc.models.component(model))
 *     ** this produces a way of INHERITANCE between charts.
 *       -- for parent to override key's on 'model', you must first call the model (set to key on 'model': model.component = mc.models.component(model)), then set the key's, overriding component's default.
 *         ** convention is to use model.component.setting(new value) to set it, instead of just model.setting = new value.  This is because chart setter's may do more than just set the argument as the value on model. (ie. d3.function(new value) )
 *
 * 'instance' object
 *   All key's on 'instance' object are for the specific element currently calculating/building
 *   ** values stored on the 'instance' object are usually 100% private EXCEPT when stored on the element's '__chart__' key (selection[i].__chart__ or selection.__chart__ when single element)
 *   ** 'instance' can be passed/shared to chart's components by passing to chart(selection, instance) or chart.calc(selection, instance) and chart.build(selection, instance) calls
 *
 */


mc.models.chartBase = function chartBase(model) {

  model = model || {};

  //============================================================
  // Public Variables with Default Settings
  // Var              Default Value

  model.name        = 'chartBase'; // used for top level class, usually matches model name
  model.margin      = {top: 0, right: 0, bottom: 0, left: 0};
  model.calcScales  = true;

  // Accessors
  model.width_      = function(container, data) { return parseInt(container.style('width')) }; // could also do container.attr('width') //TODO: test if both ALWAYS work or if one is more consistent than other
  model.height_     = function(container, data) { return parseInt(container.style('height')) };
  model.label_      = function(series, j) { return series.key };
  //model.series_     = function(data) { return data.filter(function(d) { return !d.disabled }) }; //TODO: need to handle disabled differently
  model.series_     = function(data) { return data }; //TODO: think about best way to handle disabled if not here
  model.values_     = function(series, i) { return series.values };
  model.seriesKey_  = function(series, i) { return series.key || i };
  model.pointKey_   = function(point, i, j) { return i };
  model.id_         = function() { return Math.round(Math.random() * 899999) + 100000 };


  //TODO: consider moving dimensioos into it's own file for re-use outside of SVG world
  //      ***or consider making top level chartBase with children svgBase and htmlBase (maybe more)
  // Dimensions
  // key, range, scale, accessor, disabled
  model.dimensions  = [ ];

  model.dimensions.forEach(setDimension);


  //------------------------------------------------------------


  chart.calc = function(instance, data) {

    var that = this
      , flatData
      ;

    instance.container = d3.select(this);
    instance.width     = model.width_ (instance.container, data) - model.margin.left - model.margin.right;
    instance.height    = model.height_(instance.container, data) - model.margin.top  - model.margin.bottom;


    //------------------------------------------------------------
    // Setup Chart Scales and Data Layout Calculations

    if (model.calcScales) {
      flatData = d3.merge(
        model.series_(data)
          .filter(function(d) { return !d.disabled })
          .map(function(series, j) {
            return model.values_(series, j).map(function(d, i) {
              var obj  = {};

              model.dimensions.forEach(function(dim) {
                if (model[dim.key + 'Disable']) return;
                obj[dim.key] = model[dim.key + '_'].call(this, d, i, j);
              });

              return obj;
            });
          })
      );

      // Set dimensions domain and range (rangePoints, rangeBands, rangeRoundBands if ordinal)
      model.dimensions.forEach(function(dim) {
        if (model[dim.key + 'Disable']) return;

        //TODO: investigate dimension code, see if it makes sense to have on m (instance) not just o (model)
        if (model[dim.key + 'Scale'].rangeBands) {
          // Ordinal Scale
          model[dim.key + 'Scale']
            .domain(dim.domain && dim.domain(model,instance) ||
                    typeof dim.force !== 'undefined' ?
                      flatData.map(function(d) { return d[dim.key] }).concat(dim.force)
                    : flatData.map(function(d) { return d[dim.key] }) );
        } else {
          // Quantitative Scale
          model[dim.key + 'Scale']
            .domain(dim.domain && dim.domain(model,instance) ||
                    typeof dim.force !== 'undefined' ?
                      d3.extent(d3.extent(flatData, function(d) { return d[dim.key] }).concat(dim.force))
                    : d3.extent(flatData, function(d) { return d[dim.key] }) );
        }


        // Usually for Quantitative scales
        if (dim.range)
          model[dim.key + 'Scale']
            .range(dim.range(model,instance));

        // For Ordinal scales (all 3 below)
        if (dim.rangePoints)
          model[dim.key + 'Scale']
            .rangePoints.apply(
              model[dim.key + 'Scale'],
              dim.rangePoints(model,instance)
            );

        if (dim.rangeBands)
          model[dim.key + 'Scale']
            .rangeBands.apply(
              model[dim.key + 'Scale'],
              dim.rangeBands(model,instance)
            );

        if (dim.rangeRoundBands)
          model[dim.key + 'Scale']
            .rangeRoundBands.apply(
              model[dim.key + 'Scale'],
              dim.rangeRoundBands(model,instance)
            );
      });
    }


    // Create __chart__ object on DOM container element for storing some data references (ie. scales)
    this.__chart__ = this.__chart__ || {};

    model.dimensions.forEach(function(dim) {
      instance[dim.key]     = model[dim.key + 'Scale'].copy();
      instance[dim.key+'0'] = that.__chart__[dim.key] || instance[dim.key];

      instance[dim.key+'Calc']   =   function() { return instance[dim.key]  (model[dim.key+'_'].apply(this, arguments)) || 0 }; //TODO: figure out why || 0 is needed to prevent error
      instance[dim.key+'0'+'Calc'] = function() { return instance[dim.key+0](model[dim.key+'_'].apply(this, arguments)) || 0 };
    });

    //------------------------------------------------------------

    // Store each dimension on __chart__ to retrieve later
    // (used for getting the scale from the last time the chart was called)
    model.dimensions.forEach(function(dim) {
      that.__chart__[dim.key] = instance[dim.key];
    })


    return chart;
  };



  chart.build = function(instance, data) {

    //------------------------------------------------------------
    // Setup Chart Layers

    // Chart could be SVG, HTML, or potentially something else, so no way to have
    // generic content.  Check/Use svgBase model for most things.

    //------------------------------------------------------------

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

  chart.chartName = function(_) {
    if (!arguments.length) return model.name;
    model.name = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return id_;
    id_ = d3.functor(_);
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return model.margin;
    model.margin = mc.extend(model.margin, _);
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return model.width_;
    model.width_ = d3.functor(_);
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return model.height_;
    model.height_ = d3.functor(_);
    return chart;
  };

  chart.calcScales = function(_) {
    if (!arguments.length) return model.calcScales;
    model.calcScales = _;
    return chart;
  };

  chart.label = function(_) {
    if (!arguments.length) return model.label_;
    model.label_ = d3.functor(_);
    return chart;
  };

  chart.series = function(_) {
    if (!arguments.length) return model.series_;
    model.series_ = d3.functor(_);
    return chart;
  };

  chart.values = function(_) {
    if (!arguments.length) return model.values_;
    model.values_ = d3.functor(_);
    return chart;
  };

  // This is used for adding a new dimension to the list of dimenstions.
  // TODO: consider a method to remove a dimension, but may not be needed
  chart.dimension = function(_) {
    if (!arguments.length) return model.dimensions;
    //TODO: consider auto building dimension if provided a string, ie. 'x'
    model.dimensions.push(_);
    setDimension(_);
    return chart;
  };

  //------------------------------------------------------------


  // create scales, accessors, and APIs for each dimension
  function setDimension(dim) {
    if (dim.range)           dim.range            = d3.functor(dim.range);
    if (dim.rangePoints)     dim.rangePoints      = d3.functor(dim.rangePoints);
    if (dim.rangeBands)      dim.rangeBands       = d3.functor(dim.rangeBands);
    if (dim.rangeRoundBands) dim.rangeRoundBands  = d3.functor(dim.rangeRoundBands);
    if (dim.domain)          dim.domain           = d3.functor(dim.domain);

    // build model.dimensionScale and chart.dimensionScale
    model[dim.key + 'Scale'] = dim.scale || d3.scale.linear();
    chart[dim.key + 'Scale'] = function(_) {
      if (!arguments.length) return model[dim.key + 'Scale'];
      model[dim.key + 'Scale'] = _;
      return chart;
    };

    // build model.dimension_ and chart.dimension_
    model[dim.key + '_'] = dim.accessor || function(d) { return d[dim.key] };
    chart[dim.key] = function(_) {
      if (!arguments.length) return model[dim.key + '_'];
      model[dim.key + '_'] = d3.functor(_);
      return chart;
    };

    model[dim.key + 'Disable'] = dim.disable;
    chart[dim.key + 'Disable'] = function(_) {
      if (!arguments.length) return model[dim.key + 'Disable'];
      model[dim.key + 'Disable'] = _;
      return chart;
    };

    chart[dim.key + 'Range'] = function(_) {
      if (!arguments.length) return dim.range;
      dim.range = d3.functor(_);
      return chart;
    };

    chart[dim.key + 'RangePoints'] = function(_) {
      if (!arguments.length) return dim.rangePoints;
      dim.rangePoints = d3.functor(_);
      return chart;
    };

    chart[dim.key + 'RangeBands'] = function(_) {
      if (!arguments.length) return dim.rangeBands;
      dim.rangeBands = d3.functor(_);
      return chart;
    };

    chart[dim.key + 'RangeRoundBands'] = function(_) {
      if (!arguments.length) return dim.rangeRoundBands;
      dim.rangeRoundBands = d3.functor(_);
      return chart;
    };

    chart[dim.key + 'Domain'] = function(_) {
      if (!arguments.length) return dim.domain;
      dim.domain = d3.functor(_);
      return chart;
    };

    chart[dim.key + 'Force'] = function(_) {
      if (!arguments.length) return dim.force;
      dim.force = _;
      return chart;
    };
  }

  //------------------------------------------------------------


  return chart;
};
