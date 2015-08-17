
var mc = {version: '0.0.1'}; // semver //in start.js


//============================================================
// Top Level Obects

mc.utils  = {}; // some utility functions
mc.models = {}; // each unique model in source code

//TODO: these should probably not be used... maybe when WeakMaps/WeakSets become available.
//      definitely potential here for memory leaks, but these references can be useful for things
//      like automatic resizing of charts on window resize
mc.charts = []; // each chart closure rendered
mc.graphs = {}; // each instance of a chart generated

mc.dispatch = d3.dispatch('render_start', 'render_end');

//------------------------------------------------------------


//mc.utils.windowSize = windowSize;
//mc.tooltip = tooltip;



//============================================================
// d3 prototypes

// TODO: decide on if I have to modify d3 or not (seems like this would make things at least appear simpler for users)
// **maybe shouldn't modify d3 incase that causes issues with other libraries.  Consider turning to mc.data(container)
d3.selection.prototype.chart = function() {
  var node = this.node();
  return node && node.__chart__;
}


//------------------------------------------------------------


//============================================================
// Logging
// Advanced logging, with fallback if console.log is not available
// stores log history in mc.log.history unless disabled

mc.log = (function logWrapper(showAlert, custom, disable){
  var logs = (mc.log && mc.log.history) || [],
      logger = custom ||
               showAlert && alert && function() {
                  var args = Array.prototype.slice.call(arguments),
                      m;
                  try { m = args.map(function(elem) { return JSON.stringify(elem); }).join(', '); }
                  catch(err) { m = args; }
                  window.alert(m)
               },
      ret = log;

  ret.history = logs;
  ret.alert = function(enabled, custom) {
    mc.log = logWrapper(enabled, custom);
    if (enabled && logs.length) custom ? custom(logs) :  alert(logs); //consider alerting 1 at time
  };
  ret.hide = function() {
    mc.log = logWrapper(false, function(){});
  };
  ret.kill = function() {
    mc.log = logWrapper(false, false, true);
  };

  function log() {
    if (disable) return;
    var args = Array.prototype.slice.call(arguments);
    logs.push(args);
    if (logger) logger(args);
    else console.log(args)
    return arguments[arguments.length-1]; //return last argument for in-place logging
  };

  return ret;
})();

//------------------------------------------------------------



//============================================================
// Chart Rendering Tools

//TODO: consider having 2 render start/end events.  One for the first time on page, one for every other time a chart is added **May not be needed, considering most webapps are single page now
mc.dispatch.on('render_start', function() {
  mc.render.startTime = +new Date();
});
mc.dispatch.on('render_end', function(e) {
  mc.render.endTime = +new Date();
  mc.render.time = mc.render.endTime - mc.render.startTime;
  mc.log(mc.charts.length + ' charts rendered in ' + mc.render.time + 'ms');
});


mc.render = function(obj, callback, defer) {
  if (typeof obj == 'function')
    obj = {build: obj, callback: callback};

  mc.render.queue.push(obj);

  if (!mc.render.active && !defer) mc.render.start();
};

mc.render.queue = [];
mc.render.start = function(stepSize) {
  stepSize = stepSize || mc.stepSize || 1; // # of charts to render per update

  mc.render.active = true;
  mc.dispatch.render_start();

  setTimeout(function renderCharts() {
    var charts = mc.render.queue.splice(0, stepSize);

    charts.forEach(function(c) {
      var chart = c.build();
      if (typeof c.callback == 'function') c.callback(null, chart);
      mc.charts.push(chart);
    });

    if (mc.render.queue.length) setTimeout(renderCharts,0);
    else {
      mc.render.active = false;
      mc.dispatch.render_end();
    }
  }, 0);
}

//------------------------------------------------------------



/*
//TODO: Figure out best way to accomplish this
mc.select = function(selector) {
  var obj = d3.select(selector);

  obj._mcObject = true;

  return obj;
}
*/


mc.rebind = function(dest, src) {
  var keys = [],
      key;

  for (key in src) {
    if (key === 'calc' || key === 'build') continue; //these are reserved functions on chart object

    keys.push(key)
  }

  d3.rebind.apply(d3, [dest, src].concat(keys));
}


//TODO: consisder using this instead of chart argument
mc.expose = function(name, obj, fn) {
  var chart = this;

  // Making separate functions so typeof doesn't need to be called everytime
  if (typeof fn === 'function')
    chart[name] = function(_) {
      if (!arguments.length) return obj;
      obj = fn(_, obj, chart);
      return chart;
    }
  else
    chart[name] = function(_) {
      if (!arguments.length) return obj;
      obj = _;
      return chart;
    }

  return chart;
};


// Simple shallow copy of objects
// TODO: decide if this should be in mc.utils
mc.extend = function(obj) {
  var i = arguments.length,
      prop;

  while (--i) {
    for (prop in arguments[i]) {
      obj[prop] = arguments[i][prop];
    }
  }

  return obj;
};


/*
// moved back into layer.js for now
mc.layer = function(options) {
  var layer = new Layer(),
      eventName;

  //TODO: figure out if user should be able to override dataBind and insert after layer is defined
  layer.dataBind = options.dataBind;
  layer.insert = options.insert;

  if ('events' in options) {
    for (eventName in options.events) {
      layer.on(eventName, options.events[eventName]);
    }
  }

  return layer;
};
*/


// Moved below from end.js (no longer need it, using gulp-wrap-js to handle wrapping code in (function(d3) { ..... })(d3);
//TODO: make sure it;s fine to have this here, and not need to be appended to the end of the built mcharts.js file
var _mc = window.mc;
mc.noConflict = function() {
  if (window.mc === mc)
    window.mc = _mc;

  return mc;
};


if (typeof define === 'function' && define.amd)
  define(mc);
else if (typeof module === 'object' && module.exports)
  module.exports = mc;
else
  window.mc = mc;
  //this.mc = mc;
