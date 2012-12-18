function Field(name, options) {
  this.name = name;
}

Field.prototype.get = function(object) {
  return object[this.name];
};

module.exports = function(name, options) {
  return new Field(name, options);
};