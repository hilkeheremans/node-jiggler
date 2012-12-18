var Serializers = module.exports = {};

require('fs').readdirSync(__dirname).forEach(function(file) {
  if (file !== 'index.js') {
    var sName = file.slice(0, file.lastIndexOf('.'));
    Serializers[sName] = require(__dirname + '/' + file);
  }
});
