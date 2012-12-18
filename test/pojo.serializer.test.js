var represent = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('POJO Serializer', function() {

  describe('jiggler', function() {
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

    it('should represent an instance with simple properties', function(done) {
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

    it('should represent an instance with an array property', function(done) {
      var user = {
        test: ['one', 'two']
      };

      represent.define(user, 'public', [
        represent.Field('test')
      ]);

      represent.as.pojo(user, 'public', function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('test').with.lengthOf(2);
        rep.test.should.include('one');
        rep.test.should.include('two');

        done();
      });
    });

    it('should represent an instance with a formatter', function(done) {
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';

      represent.define(user, 'public', [
        represent.Field('firstName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ]);

      represent.as.pojo(user, 'public', function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'D');

        done();
      });
    });
  });
});