
// TODO: consider having slightly different structure for chart components vs charts
//       **probably a bad idea... but worth a thought.  Now have 'layers' for easy tweaking of components
mc.models.axes = function axes(model) {

  model = model || {};

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  model.renderBottom    = true;
  model.renderTop       = false;
  model.renderLeft      = true;
  model.renderRight     = false;

  //scales must be passed into axes component, top/bottom defaults to xScale, left/right defaults to yScale
  //model.bottom
  //model.top
  //model.left
  //model.right

  // Components
  model.bottomAxis      = d3.svg.axis();
  model.topAxis         = d3.svg.axis();
  model.leftAxis        = d3.svg.axis();
  model.rightAxis       = d3.svg.axis();

  // Accessors
  model.bottomLabel_    = function(d) { return d.xLabel || '' };
  model.topLabel_       = function(d) { return d.xLabel || '' };
  model.leftLabel_      = function(d) { return d.yLabel || '' };
  model.rightLabel_     = function(d) { return d.yLabel || '' };

  model.bottomTickSize_ = function(height) { return [-height, 1] };
  model.topTickSize_    = function(height) { return [-height, 1] };
  model.leftTickSize_   = function(width) { return [-width, 1] };
  model.rightTickSize_  = function(width) { return [-width, 1] };

  model.bottomTicks_    = function(width) { return [Math.round(width/80)] };
  model.topTicks_       = function(width) { return [Math.round(width/80)] };
  model.leftTicks_      = function(height) { return [Math.round(height/40)] };
  model.rightTicks_     = function(height) { return [Math.round(height/40)] };

  //TODO: make Label alignment an option

  //------------------------------------------------------------



  chart.calc = function(instance, data) {
    //Currently no calculations in axes

    return chart;
  };


  chart.build = function(instance, data) {

    //TODO: FIGURE OUT WHAT SHOULD BE ON INSTANCE

    //TODO: Consider using a layer for each axis


    //TODO: assume all charts using axes model have inherited chartBase

    var container = d3.select(this);

    // Elements
    //TODO: axes wrap, etc. are likelt separate from parent chart's wrap/g so either don't store on 'instance' or use unique name //TODO: investigate, might be able to actuallly use paren;t wrap/g
    var wrap, wrapEnter, g, gEnter;


    // Assume scales are setup by parent model

    //------------------------------------------------------------
    // Setup Chart Layers

    //TODO: consider using only wrap/wrapEnter, no g/gEnter
    wrap      = container.selectAll('g.mc-axes').data([data]);
    wrapEnter = wrap.enter().append('g').attr('class', 'mc-axes');
    gEnter    = wrapEnter.append('g');
    g         = wrap.select('g');

    gEnter.append('g').attr('class', 'mc-axis mc-bottomAxis');
    gEnter.append('g').attr('class', 'mc-axis mc-topAxis');
    gEnter.append('g').attr('class', 'mc-axis mc-leftAxis');
    gEnter.append('g').attr('class', 'mc-axis mc-rightAxis');

    //------------------------------------------------------------


    //------------------------------------------------------------
    // Bottom Axis

    if (model.renderBottom) {
      model.bottomAxis
        .scale(model.bottom || instance.x)
        .orient('bottom')
        ;
      model.bottomAxis
        .tickSize.apply(model.bottomAxis, model.bottomTickSize_(instance.height))
        ;
      model.bottomAxis
        .ticks.apply(model.bottomAxis, model.bottomTicks_(instance.width))
        ;
      gEnter.select('.mc-bottomAxis').append('g')
          .attr('class', 'x axis')  //TODO: mc- namespace these classes?
        .append('text')
          .attr('class', 'label')  //TODO: mc- namespace these classes?
          .attr('dx', -6)
          .attr('dy', -6)
          .style('text-anchor', 'end')
          ;
      g.select('.mc-bottomAxis .label')
          .attr('x', instance.width)
          .text(model.bottomLabel_);
          ;
      g.select('.mc-bottomAxis .x.axis')
          .attr('transform', 'translate(0,' + instance.height + ')')
          .call(model.bottomAxis)
          ;
    }

    //------------------------------------------------------------


    //------------------------------------------------------------
    // Top Axis

    if (model.renderTop) {
      model.topAxis
        .scale(model.top || instance.x)
        .orient('top')
        ;
      model.topAxis
        .tickSize.apply(model.topAxis, model.topTickSize_(instance.height))
        ;
      model.topAxis
        .ticks.apply(model.topAxis, model.topTicks_(instance.width))
        ;
      gEnter.select('.mc-topAxis').append('g')
          .attr('class', 'x axis')
        .append('text')
          .attr('class', 'label')
          .attr('dy', '1em')
          .attr('dx', '-2em')
          .style('text-anchor', 'end')
          ;
      g.select('.mc-topAxis .label')
          .attr('x', instance.width)
          .text(model.topLabel_);
          ;
      g.select('.mc-topAxis .x.axis')
          //.attr('transform', 'translate(0,0)')
          .call(model.topAxis)
          ;
    }

    //------------------------------------------------------------


    //------------------------------------------------------------
    // Left Axis

    if (model.renderLeft) {
      model.leftAxis
        .scale(model.left || instance.y)
        .orient('left')
        ;
      model.leftAxis
        .tickSize.apply(model.leftAxis, model.leftTickSize_(instance.width))
        ;
      model.leftAxis
        .ticks.apply(model.leftAxis, model.leftTicks_(instance.height))
        ;
      gEnter.select('.mc-leftAxis').append('g')
          .attr('class', 'y axis')
        .append('text')
          .attr('class', 'label')
          .attr('transform', 'rotate(90)')
          .attr('dx', 6)
          .attr('dy', -6)
          .style('text-anchor', 'start')
          ;
      g.select('.mc-leftAxis .label')
          .text(model.leftLabel_)
          ;
      g.select('.mc-leftAxis .y.axis')
          .call(model.leftAxis)
          ;
    }

    //------------------------------------------------------------


    //------------------------------------------------------------
    // Right Axis

    if (model.renderRight) {
      model.rightAxis
        .scale(model.right || instance.y)
        .orient('right')
        ;
      model.rightAxis
        .tickSize.apply(model.rightAxis, model.rightTickSize_(instance.width))
        ;
      model.rightAxis
        .ticks.apply(model.rightAxis, model.rightTicks_(instance.height))
        ;
      gEnter.select('.mc-rightAxis').append('g')
          .attr('class', 'y axis')
        .append('text')
          .attr('class', 'label')
          .attr('transform', 'rotate(-90)')
          .attr('dy', -6)
          .attr('dx', -6)
          .style('text-anchor', 'end')
          ;
      g.select('.mc-rightAxis .label')
          .text(model.rightLabel_)
          ;
      g.select('.mc-rightAxis .y.axis')
          .attr('transform', 'translate(' + instance.width + ',0)')
          .call(model.rightAxis)
          ;
    }

    //------------------------------------------------------------

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
  //------------------------------------------------------------

  // TODO: figure out best way to expose these so we can use mc.rebind instead of manually rebinding every key
  // TODO: consider using defineProperty and making non enumerable
  chart.bottomAxis = model.bottomAxis;
  chart.topAxis    = model.topAxis;
  chart.leftAxis   = model.leftAxis;
  chart.rightAxis  = model.rightAxis;


  chart.bottomScale = function(_) {
    if (!arguments.length) return model.bottom;
    model.bottom = _;
    return chart;
  };

  chart.topScale = function(_) {
    if (!arguments.length) return model.top;
    model.top = _;
    return chart;
  };

  chart.leftScale = function(_) {
    if (!arguments.length) return model.left;
    model.left = _;
    return chart;
  };

  chart.rightScale = function(_) {
    if (!arguments.length) return model.right;
    model.right = _;
    return chart;
  };

  //TODO: might want to rename these for when they are rebinded to complete charts (ie. barChart.renderRight vs. barChart.renderRightAxis)
  chart.renderBottom = function(_) {
    if (!arguments.length) return model.renderBottom;
    model.renderBottom = _;
    return chart;
  };

  chart.renderTop = function(_) {
    if (!arguments.length) return model.renderTop;
    model.renderTop = _;
    return chart;
  };

  chart.renderLeft = function(_) {
    if (!arguments.length) return model.renderLeft;
    model.renderLeft = _;
    return chart;
  };

  chart.renderRight = function(_) {
    if (!arguments.length) return model.renderRight;
    model.renderRight = _;
    return chart;
  };

  chart.bottomLabel = function(_) {
    if (!arguments.length) return model.bottomLabel_;
    model.bottomLabel_ = d3.functor(_);
    return chart;
  };

  chart.topLabel = function(_) {
    if (!arguments.length) return model.topLabel_;
    model.topLabel_ = d3.functor(_);
    return chart;
  };

  chart.leftLabel = function(_) {
    if (!arguments.length) return model.leftLabel_;
    model.leftLabel_ = d3.functor(_);
    return chart;
  };

  chart.rightLabel = function(_) {
    if (!arguments.length) return model.rightLabel_;
    model.rightLabel_ = d3.functor(_);
    return chart;
  };

  chart.bottomTickSize = function(_) {
    if (!arguments.length) return model.bottomTickSize_;
    model.bottomTickSize_ = d3.functor(_);
    return chart;
  };

  chart.topTickSize = function(_) {
    if (!arguments.length) return model.topTickSize_;
    model.topTickSize_ = d3.functor(_);
    return chart;
  };

  chart.leftTickSize = function(_) {
    if (!arguments.length) return model.leftTickSize_;
    model.leftTickSize_ = d3.functor(_);
    return chart;
  };

  chart.rightTickSize = function(_) {
    if (!arguments.length) return model.rightTickSize_;
    model.rightTickSize_ = d3.functor(_);
    return chart;
  };

  chart.bottomTicks = function(_) {
    if (!arguments.length) return model.bottomTicks_;
    model.bottomTicks_ = d3.functor(_);
    return chart;
  };

  chart.topTicks = function(_) {
    if (!arguments.length) return model.topTicks_;
    model.topTicks_ = d3.functor(_);
    return chart;
  };

  chart.leftTicks = function(_) {
    if (!arguments.length) return model.leftTicks_;
    model.leftTicks_ = d3.functor(_);
    return chart;
  };

  chart.rightTicks = function(_) {
    if (!arguments.length) return model.rightTicks_;
    model.rightTicks_ = d3.functor(_);
    return chart;
  };

  //------------------------------------------------------------


  return chart;
};
