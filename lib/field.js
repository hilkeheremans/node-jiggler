function Field(name, options) {
  options = options || {};

  this.name = name;
  this.formatter = options.formatter;
  this.template = options.template;
  this.src = options.src;
}

Field.prototype.get = function(object, context, callback) {
  var value = object[this.name];
  if (this.formatter && value !== undefined) {
    value = this.formatter(value);
  }
  if (this.src) {
    if (typeof this.src === 'function') {
      return this.src(object, context, callback);
    }
  }

  callback(null, value);
};

module.exports = function(name, options) {
  return new Field(name, options);
};