'use strict';

var S       = require('string'),
    async   = require('async'),
    _       = require('underscore');

function underscore(obj, cb) {
  var serialized = {};

  async.forEach(_.keys(obj), function(field, next) {
    if (_.isObject(obj[field])) {
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