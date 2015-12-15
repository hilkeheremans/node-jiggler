function Field(name, options) {
  if (typeof options === 'string') {
    options = {
      src: options
    };
  }
  options = options || {};

  this.name = name;
  this.formatter = options.formatter;
  this.template = options.template;
  this.src = options.src;
  this.type = options.type;
  this.description = options.description;
}

Field.prototype.get = function(object, context, callback) {
  if (this.src && typeof this.src === 'function') {
    return this.src(object, context, callback);
  }

  var value = object[this.src || this.name];
  if (this.formatter && value !== undefined) {
    value = this.formatter(value);
  }

  callback(null, value);
};

module.exports = function(name, options) {
  return new Field(name, options);
};