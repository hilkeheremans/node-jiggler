var _ = require('underscore')
    , async = require('async')
    , R = require('../index');

function asRepresentation(object, template, options, callback) {
  if (!template) throw new Error('A template must be specified');

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!callback) throw new Error('A callback must be specified');

  var defaults = {
    stripUndefined: true,
  };
  options = _.extend(defaults, options);

  processObject(object, template, options, callback);
}

function processObject(object, template, options, callback) {
  if (_.isArray(object)) {
    // Recursively process array elements

    var results = [];
    async.forEach(object, function(object, next) {
      processObject(object, template, options, function(err, representation) {
        if (err) return next(err);

        results.push(representation);
        return next();
      });
    }, function(err) {
      return callback(err, results);
    });
  } else if (typeof object === 'object') {
    // Objects will be formatted using the template

    if (!(R.JIGGLER_KEY in object))
      throw new Error('No templates are registered on the this object');

    var rep = object[R.JIGGLER_KEY];
    if (!(template in rep))
      throw new Error('A template named "' + template + '" is not defined');

    var serialized = {};
    async.forEach(rep[template].fields, function(field, next) {
      var value = field.get(object);
      asRepresentation(value, template, options, function(err, fieldRepresentation) {
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


module.exports = asRepresentation;