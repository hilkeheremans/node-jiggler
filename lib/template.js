var _ = require('underscore')
    , async = require('async')
    , J = require('./index');

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

  transformObject(this, object, options, callback);
};

module.exports = function(name, fields) {
  return new Template(name, fields);
};

/**
 * Transforms an object or array
 * @api private
 *
 */

function transformObject(template, object, options, callback) {
  if (_.isArray(object)) {
    // Recursively process array elements

    var results = [];
    async.forEach(object, function(object, next) {
      transformObject(template, object, options, function(err, representation) {
        if (err) return next(err);

        results.push(representation);
        return next();
      });
    }, function(err) {
      return callback(err, results);
    });
  } else if (typeof object === 'object') {

    // Attempt to format objects using the template
    var templateToUse = template;
    if ((J.JIGGLER_KEY in object.constructor)) {
      var rep = object.constructor[J.JIGGLER_KEY];
      if (!(template.name in rep.templates))
        throw new Error('A template named "' + template.name + '" is not defined in ' + JSON.stringify(object));
      templateToUse = rep.templates[template.name];
    }

    var serialized = {};
    async.forEach(templateToUse.fields, function(field, next) {
      var value = field.get(object);

      // Allow for specifying a template for the field
      if (field.template) {
        template = value.constructor[J.JIGGLER_KEY].templates[field.template];
      }

      transformObject(template, value, options, function(err, fieldRepresentation) {
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