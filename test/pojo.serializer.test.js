var represent = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('POJO Serializer', function() {

  describe('represent', function() {
    var User = function() {
      this.firstName = '';
      this.lastName = '';
    };

    it('should require a template name', function() {
      var user = new User();
      represent.define(user, 'public', []);

      (function() {
        represent.as.pojo(user, undefined, function() { });
      }).should.throw();
    });

    it('should require a valid template name', function() {
      var user = new User();
      represent.define(user, 'public', []);

      (function() {
        represent.as.pojo(user, 'alternative', function() { });
      }).should.throw();
    });

    it('should accept optional arguments', function(done) {
      var user = new User();
      represent.define(user, 'public', []);

      represent.as.pojo(user, 'public', {}, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);
        done();
      });
    });

    it('should represent an instance', function(done) {
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';

      represent.define(user, 'public', [
        represent.Field('firstName'),
        represent.Field('lastName')
      ]);

      represent.as.pojo(user, 'public', function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('lastName', 'Seaworth');

        done();
      });
    });
  });
});