var _ = require('underscore')
    , async = require('async');

var R = module.exports = {};

R.JIGGLER_KEY = '_jiggler';
R.Field = require('./field');
R.Template = require('./template');

/**
 * Define a new template on the class specified
 *
 * @param {Object} [addToClass] optional class this template is being defined on
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

R.define = function(addToClass, template, fields, options) {
  if (typeof addToClass === 'string') {
    options = fields;
    fields = template;
    template = addToClass;
    addToClass = undefined;
  }
  options = options || {};

  var addTo;
  if (_.isFunction(addToClass)) {
    addTo = addToClass.prototype;
  } else if (addToClass !== undefined) {
    throw new Error('Definitions should only be added to classes. You can define an unregistered template by omitting the addToClass argument.');
  }

  if (!(R.JIGGLER_KEY in addTo))
    addTo[R.JIGGLER_KEY] = {};
  var r = addTo[R.JIGGLER_KEY];

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

  var t = new R.Template(template, fields);
  r[template] = t;
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

R.represent = function(object, template, options, callback) {
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
R.as = require('./serializers');