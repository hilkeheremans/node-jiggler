var _ = require('lodash')
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
    async.map(object, function(object, next) {
      transformObject(template, object, options, function(err, representation) {
        if (err) return next(err);

        return next(null, representation);
      });
    }, function(err, results) {
      return callback(err, results);
    });
  } else if (object !== null && typeof object === 'object' && template) {

    var serialized = {};
    async.forEach(template.fields, function(field, next) {
      field.get(object, options.context, function(err, value) {
        if (err) return next(err);

        // Allow for specifying a template for the field
        var subTemplate;
        if (field.template) {
          subTemplate = J.templates(field.template);
          if (!subTemplate)
            throw new Error('A template named "' + field.template + '" is not defined');
        }

        transformObject(subTemplate, value, options, function(err, fieldRepresentation) {
          if (err) return next(err);

          if (options.stripUndefined) {
            if (fieldRepresentation !== undefined) {
              serialized[field.name] = fieldRepresentation;
            }
          } else {
            serialized[field.name] = fieldRepresentation;
          }
          return next();
        });
      });
    }, function(err) {
      return callback(err, serialized);
    });
  } else {
    // Basic types will be returned as is

    return callback(null, object);
  }
}
