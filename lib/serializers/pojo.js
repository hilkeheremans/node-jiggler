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

  // Recursively process array elements
  if (_.isArray(object)) {
    var results = [];
    async.forEach(object, function(object, next) {
      asRepresentation(object, template, options, function(err, representation) {
        if (err) return next(err);

        results.push(representation);
        return next();
      });
    }, function(err) {
      return callback(err, results);
    });
  }

  if (!(R.JIGGLER_KEY in object)) throw new Error('No templates are registered on the this object');

  var rep = object[R.JIGGLER_KEY];
  if (!(template in rep)) throw new Error('A template named "' + template + '" is not defined');

  var serialized = {};
  _.each(rep[template].fields, function(field) {
    serialized[field.name] = field.get(object);
  });

  // Process arrays, embedded objects and virtuals
//  _.each(_.keys(serialized), function(key) {
//    var value = object.get(key);

//    if (_.isArray(value)) {
//      serialized[key] = [];
//      _.each(value, function(arrayObject) {
//        serialized[key].push(objectToAPIObject(arrayObject, opts));
//      });
//    }
//    else if (typeof value === 'object') {
//      serialized[key] = objectToAPIObject(value, opts);
//    }

//    if (_.isFunction(replacer)) {
//      serialized[key] = replacer(key, value);
//    }
//  });

  return callback(null, serialized);
}


module.exports = asRepresentation;