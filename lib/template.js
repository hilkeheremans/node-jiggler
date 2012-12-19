var _ = require('underscore')
    , async = require('async');

function Template(name, fields) {
  this.name = name;
  this.fields = fields;
}

/**
 * Executes a template representation on an object or array of objects
 *
 * @param object object or array of objects to be represented
 * @param [options]
 * @param callback
 * @api public
 *
 */

Template.prototype.represent = function(object, options, callback) {
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

module.exports = function(name, fields) {
  return new Template(name, fields);
};

/**
 * Transforms an object or array using the provided template
 * @api private
 *
 */

function transformObject(object, template, options, callback) {
  if (_.isArray(object)) {
    // Recursively process array elements

    var results = [];
    async.forEach(object, function(object, next) {
      transformObject(object, template, options, function(err, representation) {
        if (err) return next(err);

        results.push(representation);
        return next();
      });
    }, function(err) {
      return callback(err, results);
    });
  } else if (typeof object === 'object' && !options.bypassTemplate) {
    // Objects will be formatted using the template

    if (!(R.JIGGLER_KEY in object))
      throw new Error('No templates are registered on ' + JSON.stringify(object));

    var rep = object[R.JIGGLER_KEY];
    if (!(template in rep))
      throw new Error('A template named "' + template + '" is not defined');

    var serialized = {};
    async.forEach(rep[template].fields, function(field, next) {
      var value = field.get(object);
      var fieldOptions = _.clone(options);

      // If the sub-object does not have template definitions, bypass them
      if (typeof value === 'object')
        fieldOptions.bypassTemplate = !(R.JIGGLER_KEY in value);

      // Allow for specifying a template for the field
      template = field.template || template;

      asRepresentation(value, template, fieldOptions, function(err, fieldRepresentation) {
        if (err) return next(err);

        if (options.stripUndefined) {
          if (fieldRepresentation !== undefined)
            serialized[field.name] = fieldRepresentation;
        } else {
          serialized[field.name] = fieldRepresentation;
        }
        return next();
      });
    }, function(err) {
      return callback(err, serialized);
    });
  } else {
    // Basic types will be returned as is
    return callback(null, object);
  }
}