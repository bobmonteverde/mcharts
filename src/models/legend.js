
mc.models.legend = function legend(model) {

  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.svgBase         = mc.models.svgBase(model);

  // Settings
  model.name            = 'legend'; // used for top level class, usually matches model name
  model.padding         = {top: 4, right: 8, bottom: 4, left: 8};
  model.orientation     = 'horizontal'; //TODO: consider a better name?
  model.horizontalAlign = 'center'; // used to position innerWidth in overall width
  model.verticalAlign   = 'center'; // used to position innerHeight in overall height

  // Accessors
  model.shape_          = d3.functor('circle'); // 'circle', 'cross', 'diamond', 'square' 'triangle-down/up'
  model.labelWidth_     = 100;
  model.labelHeight_    = 20;

  // Setup Component Settings
  model.svgBase
    .calcScales(false);

  // Setup Layers
  //TODO: consider making in chart.layers not model.layers

  model.layers = model.layers || {};

  // Going without layers initially, then may bring this back

  //------------------------------------------------------------



  chart.calc = function(instance, data) {

    model.svgBase.calc.call(this, instance, data);

    //------------------------------------------------------------
    // Calc label sizes and position

    //var series   = model.series_(data);
    var series   = data; //TODO: temp not using model.series_ due to it filtering disabled

    instance.legendElements = series.map(function(s, j) {
      return {
        series: s
      , index:  j //TODO: probably don't need to add this
      , label:  model.label_(s,j)
      , shape:  model.shape_(s,j)
      , width:  model.labelWidth_(s,j) //TODO: figure out if there is a way to get text width here without getBBox
      , height: model.labelHeight_(s,j)
      //, color: model.color_(s,j) //TODO: probably need to add color accessor
      };
    });

    instance.innerWidth  = 0;
    instance.innerHeight = 0;

    //TODO: drastically clean up this horrific code
    var column = 0, row = 0, left = model.padding.left, top = model.padding.top;
    instance.legendElements.forEach(function(elem) {
      elem.column = column;
      elem.row    = row;
      elem.left   = left;
      elem.top    = top;

      if (model.orientation === 'horizontal') {
        left += elem.width;
        column++;
        if (instance.innerHeight < top + elem.height + model.padding.bottom) {
          instance.innerHeight = top + elem.height + model.padding.bottom;
        }
        if (left + model.padding.right > instance.width) {
          column = 1;
          row++;
          left = elem.width;
          top += elem.height;  // assuming all elem.height are equal (safe to assume for now)
          elem.row = row;
          elem.column = 0;
          elem.top = top;
          elem.left = model.padding.left;
        } else if (left + model.padding.right > instance.innerWidth) {
          instance.innerWidth = left + model.padding.right;
        }
      } else { // 'vertical'
        top += elem.height;
        row++;
        if (instance.innerWidth < left + elem.width + model.padding.right) {
          instance.innerWidth = left + elem.width + model.padding.right;
        }
        if (top + model.padding.bottom > instance.height) {
          column++;
          row = 1;
          left += elem.width; //TODO: assuming all elem.width are equal ***may not be safe to assume***
          top = elem.height;
          elem.row = 0;
          elem.column = column;
          elem.top = model.padding.top;
          elem.left = left;
        } else if (top + model.padding.bottom > instance.innerHeight) {
          instance.innerHeight = top + model.padding.bottom;
        }
      }
    });


    switch (model.horizontalAlign) {
      case 'center':
        instance.leftOffset = parseInt((instance.width - instance.innerWidth) / 2);
        break;
      case 'right':
        instance.leftOffset = instance.width - instance.innerWidth;
        break;
      default: // 'left'
        instance.leftOffset = 0;
        break;
    }

    switch (model.verticalAlign) {
      case 'center':
        instance.topOffset = parseInt((instance.height - instance.innerHeight) / 2);
        break;
      case 'bottom':
        instance.topOffset = instance.height - instance.innerHeight;
        break;
      default: // 'top'
        instance.topOffset = 0;
        break;
    }

    //------------------------------------------------------------


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

    model.svgBase.build.call(this, instance, data); // This currently DOES NOTHING, but here incase someting is added

    //------------------------------------------------------------
    // Setup Chart Layers

    instance.gEnter.append('g').attr('class', 'mc-background');

    instance.gEnter.append('g').attr('class', 'mc-legendElements')
        .attr('transform', function(d) { return 'translate(' + instance.leftOffset + ',' + instance.topOffset + ')' }); // setting to prevent weird slide animation on first load //TODO: consider no transitioning this

    //------------------------------------------------------------

    //------------------------------------------------------------
    // Core Chart Code

    //TODO: maybe bring back layers later
    //instance.elems = model.layers.legendElements.draw(instance.g.select('.mc-legendElements'), model, instance, instance.legendElements);


    instance.gEnter.select('.mc-background').append('rect');

    instance.g.select('.mc-background rect').transition()
        .attr('x', instance.leftOffset)
        .attr('y', instance.topOffset)
        .attr('width', instance.innerWidth)
        .attr('height', instance.innerHeight);


    instance.g.select('.mc-legendElements').transition()
        .attr('transform', function(d) { return 'translate(' + instance.leftOffset + ',' + instance.topOffset + ')' });


    var elements = instance.g.select('.mc-legendElements').selectAll('.mc-legendElement')
        .data(instance.legendElements)

    var elementsEnter = elements.enter().append('g')
        .attr('class', function(d,i) { return 'mc-legendElement mc-legendElement-' + i + ' mc-group-' + i })
        .attr('transform', function(d) { return 'translate(' + d.left + ',' + d.top + ')' })
        .on('click',     instance.dispatch.click)
        .on('dblclick',  instance.dispatch.dblclick)
        .on('mouseover', instance.dispatch.mouseover)
        .on('mouseout',  instance.dispatch.mouseout);

    elementsEnter
      .append('path');

    elementsEnter
      .append('text')

    elements
        .classed('mc-disabled', function(d) { return d.series.disabled });

    elements.transition()
        .attr('transform', function(d) { return 'translate(' + d.left + ',' + d.top + ')' });
        //.style('fill',   instance.colorCalc)
        //.style('stroke', instance.colorCalc)

    elements.select('path')
        .attr('transform', function(d) { return 'translate(7,' + (d.height/2) + ')' })
        .attr('d', function(d) {
          return d3.svg.symbol().type(d.shape)
            .apply(this, arguments);
        });


    elements.select('text')
        .attr('dy', '1em')
        .attr('dx', '1em')
        .text(function(d) { return d.label });

    elements.exit()
        .classed('mc-legendElement-exit', true)
      .remove();


    //------------------------------------------------------------

    /*
    instance.dispatch.on('click.elementClick',         elementClick);
    instance.dispatch.on('dblclick.elementDblClick',   elementDblClick);
    instance.dispatch.on('mouseover.elementMouseover', elementMouseover);
    instance.dispatch.on('mouseout.elementMouseout',   elementMouseout);

    function elementClick() {
      mc.log('click', arguments[0].label, arguments);
    }

    function elementDblClick() {
      mc.log('dblclick', arguments[0].label, arguments);
    }

    function elementMouseover() {
      mc.log('mouseover', arguments[0].label, arguments);
    }

    function elementMouseout() {
      mc.log('mouseout', arguments[0].label, arguments);
    }
    */


    this.__chart__.chart    = chart;
    this.__chart__.update   = function() { return instance.container.call(chart) };

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


  mc.rebind(chart, model.svgBase);

  chart.legendPadding = function(_) {
    if (!arguments.length) return model.padding;
    model.padding = mc.extend(model.padding, _);
    return chart;
  };

  chart.legendOrientation = function(_) {
    if (!arguments.length) return model.orientation;
    if (_ !== 'horizontal' && _ !== 'vertical') _ = 'horizontal';
    model.orientation = _;
    return chart;
  };

  chart.legendHorizontalAlign = function(_) {
    if (!arguments.length) return model.horizontalAlign;
    if (['left', 'center', 'right'].indexOf(_) === -1) _ = 'center';
    model.horizontalAlign = _;
    return chart;
  };

  chart.legendVerticalAlign = function(_) {
    if (!arguments.length) return model.verticalAlign;
    if (['top', 'center', 'bottom'].indexOf(_) === -1) _ = 'center';
    model.verticalAlign = _;
    return chart;
  };

  chart.legendShape = function(_) {
    if (!arguments.length) return model.shape_;
    model.shape_ = d3.functor(_);
    return chart;
  };

  chart.legendLabelWidth = function(_) {
    if (!arguments.length) return model.labelWidth_;
    model.labelWidth_ = d3.functor(_);
    return chart;
  };

  chart.legendLabelHeight = function(_) {
    if (!arguments.length) return model.labelHeight_;
    model.labelHeight_ = d3.functor(_);
    return chart;
  };

  //------------------------------------------------------------


  return chart;
};
