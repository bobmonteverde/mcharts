
//TODO: Might need a 'chart' object to pass settings/functionality to layer events

//TODO: use es6 class syntax for Layer
var Layer = function() {
  //this._base = base; // base is currently being based Layer.draw call in order to put layers on top of layers, among other conveniences
  this._handlers = {};
};


// name can be 'eventName' or 'eventName.namespace' (use namespaceing to allow users to remove specific handlers in the future
Layer.prototype.on = function(name, handler) {
  var splitName = name.split('.'),
      eventName = splitName[0],
      namespace = splitName[1];

  if (!this._handlers[eventName]) this._handlers[eventName] = [];

  this._handlers[eventName].push({
    namespace: namespace,
    callback: handler
  });

  return this;
};


//remove and return all handlers with the same eventName and namespace ('eventName.namespace')
Layer.prototype.off = function(name) {
  var splitName = name.split('.'),
      eventName = splitName[0],
      namespace = splitName[1],
      handlers = [];

  if (!this._handlers[eventName] || !this._handlers[eventName].length) return null;

  for (var i in this._handlers[eventName]) {
    if (this._handlers[eventName][i].namespace !== namespace) {
      handlers.push(this._handlers[eventName][i]);
      this._handlers.splice(i, 1);
    }
  }

  return handlers.length ? handlers : null;
};


Layer.prototype.draw = function(base, model, instance, data) {
  this._base = base;

  var bound, entering, events, event, selection, handlers;

  //TODO: think about how data is passed in (possibly multiple ways?)
  bound = this.dataBind.call(this._base, model, instance, data);
  entering = bound.enter();


  events = [
    {
      name: 'update',
      selection: bound
    },
    {
      name: 'enter',
      selection: entering,
      method: this.insert  //TODO: currently doesn't get model/instance, shouldn't need it, but might
    },
    {
      name: 'merge',
      selection: bound
    },
    {
      name: 'exit',
      selection: bound,
      method: bound.exit
    }
  ];



  for (var i in events) {
    event = events[i];
    selection = event.selection;

    if (typeof event.method === 'function')
      selection = event.method.call(selection);

    if (selection.empty()) continue; //nothing to work on


    //TODO: Decide if handlers need both 'model' and 'instance' objects passed in

    handlers = this._handlers[event.name];

    if (handlers && handlers.length) {
      for (var j in handlers) {
        handlers[j].callback.call(selection, model, instance);
      }
    }


    handlers = this._handlers[event.name + ':transition'];

    if (handlers && handlers.length) {
      selection = selection.transition();
      for (var j in handlers) {
        handlers[j].callback.call(selection, model, instance);
      }
    }
  }

  return bound; // bound is returned to allow stacking layers
};



//TODO: Consider making a way to generate a layer without a base defined initially
//      *The base should only be required when you draw

d3.selection.prototype.mlayer = function(options) {
  var layer = new Layer(this),
      eventName;

  //TODO: figure out if user should be able to override dataBind and insert after layer is defined
  layer.dataBind = options.dataBind;
  layer.insert = options.insert;

  if ('events' in options) {
    for (eventName in options.events) {
      layer.on(eventName, options.events[eventName]);
    }
  }

  this.on = function() { return layer.on.apply(layer, arguments); };
  this.off = function() { return layer.off.apply(layer, arguments); };
  this.draw = function() { return layer.draw.apply(layer, arguments); };

  return this;
};


//TODO: Consider making a way to remove a layer (returning the layer)
//        and make it possible to bind a premade layer
//        (ie. after removing it from somewhere else)


if (mc)
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

