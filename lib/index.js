var R = module.exports = {};

R.JIGGLER_KEY = '_jiggler';
R.Field = require('./field');

// Adds a new template definition to an object or class
R.define = function(object, templateName, fields) {
  var addTo = object;
  if (typeof object === 'function') {
    addTo = object.prototype;
  }

  if (!(R.JIGGLER_KEY in addTo))
    addTo[R.JIGGLER_KEY] = {};

  var r = addTo[R.JIGGLER_KEY];
  r[templateName] = {
    fields: fields
  };
};

R.as = require('./serializers');