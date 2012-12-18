var _ = require('underscore');

var R = module.exports = {};

R.JIGGLER_KEY = '_jiggler';
R.Field = require('./field');

// Adds a new template definition to an object or class
R.define = function(object, template, fields, options) {
  var addTo = object;
  if (typeof object === 'function') {
    addTo = object.prototype;
  }

  if (!(R.JIGGLER_KEY in addTo))
    addTo[R.JIGGLER_KEY] = {};

  var r = addTo[R.JIGGLER_KEY];

  options = options || {};

  // Handle extended templates
  if (options.extends) {
    if (!(options.extends in r)) throw new Error('A template named "' + options.extends + '" is not defined');

    r[options.extends].fields.forEach(function(field) {
      // Only add base fields if they are not in the extended template
      var isInExtended = _.find(fields, function(extendedField) {
        return extendedField.name === field.name;
      });

      if (!isInExtended)
        fields.unshift(_.clone(field));
    });
  }

  r[template] = {
    fields: fields
  };
};

R.as = require('./serializers');