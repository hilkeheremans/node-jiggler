var represent = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('Represent', function() {

  describe('define', function() {
    it('should add representations to a class', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      represent.define(User, 'public', []);

      var newUser = new User();
      newUser.should.have.property('_represent');
      var r = newUser._represent;
      r.public.should.be.a('object');
    });

    it('should add representations to an instance', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      represent.define(user, 'public', []);

      user.should.have.property('_represent');
      var r = user._represent;
      r.public.should.be.a('object');
    });

    it('should define fields in a representation', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      represent.define(user, 'public', [
        represent.Field('firstName')
      ]);

      var r = user._represent;
      r.public.should.have.property('fields').with.lengthOf(1);
      var field = r.public.fields[0];
      field.should.have.property('name', 'firstName');
    })
  });

  describe('represent', function() {
    var user = {
      firstName: '',
      lastName: ''
    };

    represent.define(user, 'public', []);

    it('should add pojo serializer', function(done) {
      represent.as.pojo(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });

    it('should add json serializer', function(done) {
      represent.as.json(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });
  });
});