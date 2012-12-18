function Field(name, options) {
  options = options || {};

  this.name = name;
  this.formatter = options.formatter;
  this.template = options.template;
}

Field.prototype.get = function(object) {
  var value = object[this.name];
  if (this.formatter) {
    value = this.formatter(value);
  }
  return value;
};

module.exports = function(name, options) {
  return new Field(name, options);
};