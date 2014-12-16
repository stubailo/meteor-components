// Write your package code here!

// Reactive dict that doesn't serialize anything
var SimpleReactiveDict = function () {
  var keys = {};
  var deps = {};

  var ensureDeps = function(key) {
    if(!deps[key]) {
      deps[key] = new Tracker.Dependency();
    }
  };

  return {
    set: function(key, value) {
      ensureDeps(key);
      keys[key] = value;
      deps[key].changed();
    },

    get: function(key) {
      ensureDeps(key);
      deps[key].depend();
      return keys[key];
    }
  };
};

Component = {};

var ComponentInstance = function (templateInst) {
  var self = this;
  var subHandles = new ReactiveVar([]);
  self.subscribe = function (/* subscription args */) {
    var handle = Meteor.subscribe.apply(Meteor, arguments);
    subHandles.set(subHandles.get().concat(handle));
    return handle;
  };

  self._unsubAll = function () {
    _.each(subHandles, function (handle) {
      handle.stop();
    });
  };

  self.ready = function () {
    return _.all(subHandles.get(), function (handle) {
      return handle.ready();
    });
  };

  self.autorun = _.bind(templateInst.autorun, templateInst);

  // XXX if we can somehow generate a unique ID for this, we could use
  // reactive dict to persist on HCP
  self.state = new SimpleReactiveDict();

  // XXX wrap read-write and read-only args appropriately
  self.args = new SimpleReactiveDict();
  var updateArg = _.bind(self.args.set, self.args);
  self.args.set = function () {
    throw new Error("Cannot currently set an argument.");
  };

  self.autorun(function () {
    // The data context is the template arguments. Might need some hack to
    // XXX distinguish keyword args from old-school data context
    var args = Template.currentData();

    // XXX be reactive in the opposite direction so that we can communicate
    // to parents
    _.each(args, function (argVal, argName) {
      updateArg(argName, argVal);
    });
  });

  // XXX bind all methods?
  self.find = _.bind(templateInst.find, templateInst);
  self.$ = _.bind(templateInst.$, templateInst);

  // Trigger DOM events
  self.trigger = function (eventName, propertiesToAdd) {
    var event = jQuery.Event(eventName);
    _.extend(event, propertiesToAdd);
    $(templateInst.firstNode).trigger(event);
  };

  self._templateInstance = templateInst;
  //Aim to find Template.TEMPLATE_NAME.PROP;
  self.lookupProp = function (view, prop) {
    var template;
    var origView = view;
    var value;

    while (view) {
      if (view.template && view.template.__helpers.has(prop)) {
        return view.template.__helpers.get(prop);
      } else if (view.template && view.template[prop]) {
        return view.template[prop];
      } else {
        view = view.parentView;
      }
    }
    return undefined;
  };

  self.getTemplateInstance = function () {

  };
};

Component.define = function (template, definition) {
  // XXX need more protection against changing things like helpers/events
  definition = _.clone(definition);

  var tmplName = template.viewName.split(".")[1];

  // XXX do we want a prefix of some kind?
  var domName = tmplName;

  // Wrap HTML in a component tag
  var oldRenderFunc = template.renderFunction;
  template.renderFunction = function () {
    return HTML.getTag(domName)(oldRenderFunc.call(this));
  };

  // Assign all the callbacks to the template and bind them to component
  // instance
  template.created = function () {
    var templateInst = this;
    templateInst._component = new ComponentInstance(templateInst);

    if (definition.methods) {
      // Assign API methods
      _.extend(templateInst._component, definition.methods);
      _.bindAll(templateInst._component, _.keys(definition.methods));
    }

    if (definition.created) {
      definition.created.call(templateInst._component);
    }
  };

  template.rendered = function () {
    var templateInst = this;

    // XXX Assign all API methods to the DOM element itself
    // XXX not sure if good idea, could do a Blaze hack

    if (definition.rendered) {
      definition.rendered.call(templateInst._component);
    }
  };

  template.destroyed = function () {
    var templateInst = this;
    if (definition.destroyed) {
      definition.destroyed.call(templateInst._component);
      templateInst._component._unsubAll();
    }
  };

  // Assign events
  var boundEvents = {};

  // XXX can't pass in arguments? use data- instead?
  _.each(definition.events, function (handler, eventDescriptor) {
    // Bind events to the component instance
    boundEvents[eventDescriptor] = function (event, templateInst) {
      return handler.call(templateInst._component, event, templateInst);
    };
  });

  template.events(boundEvents);

  // Assign helpers
  var boundHelpers = {};

  // XXX cache helpers since they don't depend on the data context anymore
  _.each(definition.helpers, function (helper, helperName) {
    boundHelpers[helperName] = function (/* helper args */) {
      return helper.apply(Template.instance()._component, arguments);
    };
  });

  // Assign methods as helpers
  _.each(definition.methods, function (callback, callbackName) {
    if (boundHelpers[callbackName]) {
      console.log("Can't attach a method named the same as a helper.");
    } else {
      boundHelpers[callbackName] = function () {
        return _.bind(callback, templateInst);
      };
    }
  });

  template.helpers(boundHelpers);

  // Assign helpers to get state/args
  template.helpers({
    args: function (argName) {
      return Template.instance()._component.args.get(argName);
    },
    state: function (stateVarName) {
      return Template.instance()._component.state.get(stateVarName);
    }
  });
};
