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
    });

    it('should create extended representations', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      jiggler.define(user, 'public', [
        jiggler.Field('firstName')
      ]);
      jiggler.define(user, 'extended', [
          jiggler.Field('lastName')
      ], {extends: 'public'});

      var r = user[jiggler.JIGGLER_KEY];
      r.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.extended.fields[0];
      field.should.have.property('name', 'firstName');
      field = r.extended.fields[1];
      field.should.have.property('name', 'lastName');
    });

    it('should throw if the extended template does not exist', function() {
      var user = {};

      jiggler.define(user, 'public', []);

      (function() {
        jiggler.define(user, 'extended', [], {extends: 'undefined'});
      }).should.throw();
    });

    it('should allow extended representations to override base implementations', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      jiggler.define(user, 'public', [
        jiggler.Field('firstName'),
        jiggler.Field('lastName')
      ]);
      jiggler.define(user, 'extended', [
        jiggler.Field('lastName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ], {extends: 'public'});

      var r = user[jiggler.JIGGLER_KEY];
      r.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.extended.fields[1];
      field.should.have.property('name', 'lastName');
      field.should.have.property('formatter');
      field.formatter.should.be.a('function');
    });
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