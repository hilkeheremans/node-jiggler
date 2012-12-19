var _ = require('underscore')
    , async = require('async');

var J = module.exports = {};
J.Field = require('./field');
J.Template = require('./template');

/**
 * Key that jiggler will attach to classes for serialization purposes.
 * You may override if your objects have a jiggle property. (Really?)
 * @type {String}
 */

J.JIGGLER_KEY = 'jiggle';


/**
 * Define a new template on the class specified
 *
 * @param {Object} addToClass class this template is being defined on
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

J.define = function(addToClass, template, fields, options) {
  options = options || {};

  if (!_.isFunction(addToClass))
    throw new Error('Definitions must be added to classes.');

  if (!(J.JIGGLER_KEY in addToClass))
    addToClass[J.JIGGLER_KEY] = {templates:{}, as:{}};
  var r = addToClass[J.JIGGLER_KEY];

  // Handle extended templates
  if (options.extends) {
    if (!(options.extends in r.templates))
      throw new Error('A template named "' + options.extends + '" is not defined');

    r.templates[options.extends].fields.forEach(function(field) {
      // Only add base fields if they are not in the extended template
      var isInExtended = _.find(fields, function(extendedField) {
        return extendedField.name === field.name;
      });

      if (!isInExtended)
        fields.unshift(_.clone(field));
    });
  }

  var t = new J.Template(template, fields);
  r.templates[template] = t;
  r.as[template] = function() {
    t.represent.apply(t, arguments);
  };
  return t;
};

/**
 * Registry of serializers
 *
 * @api public
 */
J.as = require('./serializers');