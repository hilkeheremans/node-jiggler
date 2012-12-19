var _ = require('underscore')
    , async = require('async');

var J = module.exports = {};

J.JIGGLER_KEY = '_jiggler';
J.Field = require('./field');
J.Template = require('./template');

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

  var addTo;
  if (_.isFunction(addToClass)) {
    addTo = addToClass.prototype;
  } else {
    throw new Error('Definitions must be added to classes.');
  }

  if (!(J.JIGGLER_KEY in addTo))
    addTo[J.JIGGLER_KEY] = {templates:{}, as:{}};
  var r = addTo[J.JIGGLER_KEY];

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
  r.as[template] = t.represent;
  return t;
};

/**
 * Executes a representation template on the provided object or array of objects
 * using a defined template
 *
 * @param {Object} object object or array to be represented
 * @param {Object} template name of the defined template
 * @param {Object} [options]
 * @param {Function} callback
 * @api public
 *
 * Options:
 *
 *   - `stripUndefined` Whether to strip undefined fields from the transformed output. Defaults to true.
 *
 */

J.represent = function(object, template, options, callback) {
  if (!template) throw new Error('A template must be specified');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!callback) throw new Error('A callback must be specified');

  var defaults = {
    stripUndefined: true
  };
  options = _.extend(defaults, options);

  transformObject(object, template, options, callback);
};

/**
 * Registry of serializers
 *
 * @api public
 */
J.as = require('./serializers');