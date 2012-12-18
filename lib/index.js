var R = module.exports = {};

R.REPRESENT_KEY = '_represent';
R.Field = require('./field');

// Adds a new template definition to an object or class
R.define = function(object, templateName, template) {
  var addTo = object;
  if (typeof object === 'function') {
    addTo = object.prototype;
  }

  if (!(R.REPRESENT_KEY in addTo))
    addTo[R.REPRESENT_KEY] = {};

  var r = addTo[R.REPRESENT_KEY];
  r[templateName] = function() {

  };
};

R.as = require('./serializers');