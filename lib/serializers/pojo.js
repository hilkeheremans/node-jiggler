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
    stripUndefined: true
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


module.exports = asRepresentation;