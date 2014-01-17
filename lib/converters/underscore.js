'use strict';

var S       = require('string'),
    async   = require('async'),
    _       = require('lodash');

function underscore(obj, cb) {
  var serialized = {};

  async.forEach(_.keys(obj), function(field, next) {
    if (_.isArray(obj[field])) {
      var results = [];
      async.forEach(obj[field], function(object, arrNext) {
        if (!_.isObject(object)) {
          results.push(object);
          return arrNext();
        } else {
          underscore(object, function(err, underscored) {
            if (err) return arrNext(err);

            results.push(underscored);
            return arrNext();
          });
        }
      }, function() {
        serialized[S(field).underscore().s] = results;
        next();
      });
    } else if (_.isObject(obj[field])) {
      underscore(obj[field], function(err, subObj) {
        serialized[S(field).underscore().s] = subObj;
        next(err);
      });
    } else {
      serialized[S(field).underscore().s] = obj[field];
      next();
    }
  }, function(err) {
    return cb(err, serialized);
  });
}

module.exports = underscore;