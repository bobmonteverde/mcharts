
mc.models.voronoi = function voronoi(model) {
  model = model || {};

  //============================================================
  // Public Variables with Default Settings

  // Components
  model.xyChartBase = mc.models.xyChartBase(model);

  // Settings
  model.name        = 'voronoi'; // used for top level class, usually matches model name
  model.clipTiles   = false;

  // Accessors
  model.active_     = d => !d.notActive;
  model.clipRadius_ = () => 25;

  // Setup Component Settings

  // Setup Layers
  //TODO: consider making in chart.layers not model.layers

  model.layers      = model.layers || {};


  model.layers.tiles = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('path')
        .data(data); // 'data' passed into draw function IS instance.voronoi
        //.data(instance.voronoi);
    },
    insert: function() {
      return this.append('path')
        .classed('mc-tile', true);
    },
    events: {
      'enter': function(model, instance) {
        return this
          .on('click', function(d) {
            instance.dispatch.click(
              d.point, d.pointIndex, d.seriesIndex, // the usual standard 3 arguments
              {
                point:       d.point,
                series:      d.series,
                pos:         [instance.xCalc.call(this, d.point, d.pointIndex, d.seriesIndex), instance.yCalc.call(this, d.point, d.pointIndex, d.seriesIndex)],
                seriesIndex: d.seriesIndex,
                pointIndex:  d.pointIndex,
              }
            );
          })
          .on('dblclick', function(d) {
            instance.dispatch.dblclick(
              d.point, d.pointIndex, d.seriesIndex, // the usual standard argument
              {
                point:       d.point,
                series:      d.series,
                pos:         [instance.xCalc.call(this, d.point, d.pointIndex, d.seriesIndex), instance.yCalc.call(this, d.point, d.pointIndex, d.seriesIndex)],
                seriesIndex: d.seriesIndex,
                pointIndex:  d.pointIndex,
              }
            );
          })
          .on('mouseover', function(d) {
            instance.dispatch.mouseover(
              d.point, d.pointIndex, d.seriesIndex, // the usual standard argument
              {
                point:       d.point,
                series:      d.series,
                pos:         [instance.xCalc.call(this, d.point, d.pointIndex, d.seriesIndex), instance.yCalc.call(this, d.point, d.pointIndex, d.seriesIndex)],
                seriesIndex: d.seriesIndex,
                pointIndex:  d.pointIndex,
              }
            );
          })
          .on('mouseout', function(d) {
            instance.dispatch.mouseout(
              d.point, d.pointIndex, d.seriesIndex, // the usual standard argument
              {
                point:       d.point,
                series:      d.series,
                seriesIndex: d.seriesIndex,
                pointIndex:  d.pointIndex,
              }
            );
          });
      },
      'merge': function(model, instance) {
        return this
          .attr('class', (d, i) => `mc-tile mc-tile-${i} mc-group-${d.seriesIndex}`)
          .attr('d', d => (d.data.length === 0) ? '' : `M${d.data.join('L')}Z`);
      },
      'exit': function(model, instance) {
        return this.remove();
      }
    }
  });


  model.layers.tileClips = mc.layer({
    dataBind: function(model, instance, data) {
      return this.selectAll('circle')
        .data(instance.vertices);
    },
    insert: function() {
      return this.append('circle');
    },
    events: {
      'enter': function(model, instance) {
        return this
          .attr('r', model.clipRadius_);
      },
      'merge': function(model, instance) {
        return this
          .attr('cx', function(d) { return d[0]; })
          .attr('cy', function(d) { return d[1]; });
      },
      'exit': function(model, instance) {
        return this.remove();
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

    instance.dispatch = this.__chart__.dispatch || d3.dispatch('click', 'dblclick', 'mouseover', 'mouseout');
    instance.id       = this.__chart__.id       || model.id_.call(this, data);

    //------------------------------------------------------------
    // Setup Chart Scales and Data Layout Calculations

    let allGroups = model.series_(data);

    instance.vertices = d3.merge(
      model.series_(data)
        .map(function(group, groupIndex) {
          if (group.disabled) return false;
          return model.values_(group, groupIndex)
            .map(function(point, pointIndex) {
              let pX = model.x_.call(this, point, pointIndex, groupIndex) + Math.random() * 1e-10;
              let pY = model.y_.call(this, point, pointIndex, groupIndex) + Math.random() * 1e-10;

              return [
                instance.x(pX),
                instance.y(pY),
                point,
                pointIndex,
                groupIndex,
              ];
            })
            .filter(function(pointArray) {
              return model.active_(pointArray[2], pointArray[3]);
            });
        })
        .filter(d => !!d) //remove disabled groups
    );

    // Add point outside of corners (helps with shaping elements near the corner)
    // TODO: consider making this optional
    /*
    if (instance.vertices.length) {
      instance.vertices.push([m.x.range()[0] - 20, m.y.range()[0] - 20, null, null]);
      instance.vertices.push([m.x.range()[1] + 20, m.y.range()[1] + 20, null, null]);
      instance.vertices.push([m.x.range()[0] - 20, m.y.range()[0] + 20, null, null]);
      instance.vertices.push([m.x.range()[1] + 20, m.y.range()[1] - 20, null, null]);
    }
   */

    //TODO: use voronoi.clipExtent to clip around outside border (might be required for IE, and jsut a good idea in general)
    //      **I believe clipExtent can be used instead of instead.bounds below
    instance.bounds = d3.geom.polygon([
      [-10, -10],
      [-10, instance.height + 10],
      [instance.width + 10, instance.height + 10],
      [instance.width + 10, -10],
    ]);


    instance.voronoi = d3.geom.voronoi(instance.vertices).map((d, i) => {
      let seriesIndex = instance.vertices[i][4];
      let pointIndex  = instance.vertices[i][3];
      let series      = allGroups[seriesIndex];
      let point       = model.values_(series, seriesIndex)[pointIndex];

      return {
        'data':        instance.bounds.clip(d),
        'seriesIndex': seriesIndex,
        'series':      series,
        'pointIndex':  pointIndex,
        'point':       point,
      };
    });

    //------------------------------------------------------------

    this.__chart__.chart    = chart;
    this.__chart__.update   = () => instance.container.call(chart);
    this.__chart__.dispatch = instance.dispatch;
    this.__chart__.id       = instance.id;


    return chart;
  };


  chart.build = function(instance, data) {
    model.xyChartBase.build.call(this, instance, data);

    //------------------------------------------------------------
    // Setup Chart Layers

    instance.gEnter.append('g').attr('class', 'mc-tiles');

    //------------------------------------------------------------


    if (model.clipTiles) {
      instance.wrap.select('defs').selectAll('.mc-tile-clips')
          .data([instance.id])
        .enter().append('clipPath')
          .attr('class', 'mc-tile-clips')
          .attr('id', 'mc-tiles-clip-' + instance.id);

      instance.tileClips = model.layers.tileClips.draw(instance.wrap.select('#mc-tiles-clip-' + instance.id), model, instance, data);

      instance.g.select('.mc-tiles')
          .attr('clip-path', `url(#mc-tiles-clip-${instance.id})`);
    }


    instance.tiles = model.layers.tiles.draw(instance.g.select('.mc-tiles'), model, instance, instance.voronoi);


    return chart;
  };


  //============================================================
  // Expose Public API

  mc.rebind(chart, model.xyChartBase);


  chart.clipTiles = function(_) {
    if (!arguments.length) return model.clipTiles;
    model.clipTiles = _;
    return chart;
  };

  chart.clipRadius = function(_) {
    if (!arguments.length) return model.clipRadius_;
    model.clipRadius_ = _;
    return chart;
  };

  //------------------------------------------------------------

  return chart;
};
