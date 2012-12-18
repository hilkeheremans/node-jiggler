var R = module.exports = {};

var REPRESENT_KEY = '_represent';

// Adds a new template definition to an object or class
R.define = function(object, templateName, template) {
  var addTo = object;
  if (typeof object === 'function') {
    addTo = object.prototype;
  }

  if (!(REPRESENT_KEY in addTo))
    addTo[REPRESENT_KEY] = {};

  var r = addTo[REPRESENT_KEY];
  r[templateName] = function() {

  };
};

R.as = require('./serializers');