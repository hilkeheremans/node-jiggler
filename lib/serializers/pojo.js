module.exports = function(object, template, callback) {
  var output = JSON.stringify(object);
  callback(null, output);
};