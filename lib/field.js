var Field = function(name, options) {
  this.name = name;
};

module.exports = function(name, options) {
  return new Field(name, options);
};