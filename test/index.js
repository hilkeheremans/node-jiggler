var jiggler = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('Represent', function() {

  describe('define', function() {
    it('should add representations to a class', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      jiggler.define(User, 'public', []);

      var newUser = new User();
      newUser.should.have.property(jiggler.JIGGLER_KEY);
      var r = newUser[jiggler.JIGGLER_KEY];
      r.public.should.be.a('object');
    });

    it('should add representations to an instance', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      jiggler.define(user, 'public', []);

      user.should.have.property(jiggler.JIGGLER_KEY);
      var r = user[jiggler.JIGGLER_KEY];
      r.public.should.be.a('object');
    });

    it('should define fields in a representation', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      jiggler.define(user, 'public', [
        jiggler.Field('firstName')
      ]);

      var r = user[jiggler.JIGGLER_KEY];
      r.public.should.have.property('fields').with.lengthOf(1);
      var field = r.public.fields[0];
      field.should.have.property('name', 'firstName');
    })
  });

  describe('jiggler', function() {
    var user = {
      firstName: '',
      lastName: ''
    };

    jiggler.define(user, 'public', []);

    it('should add pojo serializer', function(done) {
      jiggler.as.pojo(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });

    it('should add json serializer', function(done) {
      jiggler.as.json(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });
  });
});