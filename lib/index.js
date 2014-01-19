var  _ = require('lodash')
    , async = require('async');

var J = module.exports = {};

J.Field = require('./field');
J.Template = require('./template');

J.templates = {};
J.as = {};
J.convert = {
  underscore: require('./converters/underscore')
};

/**
 * Define a new template on the class specified
 *
 * @param {String} template name of the defined template
 * @param {Array} fields array of Field definitions
 * @param {Object} [options]
 * @returns {Object} the defined template
 * @api public
 *
 * Options:
 *
 *   - `extends` A pre-existing template that this new template derives from
 *
 */

J.define = function(template, fields, options) {
  options = options || {};

  // Handle extended templates
  if (options.extends) {
    if (!(options.extends in J.templates))
      throw new Error('A template named "' + options.extends + '" is not defined');

    J.templates[options.extends].fields.forEach(function(field) {
      // Only add base fields if they are not in the extended template
      var isInExtended = _.find(fields, function(extendedField) {
        return extendedField.name === field.name;
      });

      if (!isInExtended) {
        var clone = _.extend(Object.create(Object.getPrototypeOf(field)), field);
        fields.unshift(clone);
      }
    });
  }

  var t = new J.Template(template, fields);
  J.templates[template] = t;
  J.as[template] = function() {
    t.represent.apply(t, arguments);
  };
  return t;
};