var J = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('Represent', function() {

  describe('define', function() {
    it('should add representations to a class', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define(User, 'public', []);

      var newUser = new User();
      newUser.should.have.property(J.JIGGLER_KEY);
      var r = newUser[J.JIGGLER_KEY];
      r.public.should.be.a('object');
    });

    it('should not add representations to an instance', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      (function() {
        J.define(user, 'public', []);
      }).should.throw();
    });

    it('should define fields in a representation', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();

      J.define(User, 'public', [
        J.Field('firstName')
      ]);


      var r = user[J.JIGGLER_KEY];
      r.public.should.have.property('fields').with.lengthOf(1);
      var field = r.public.fields[0];
      field.should.have.property('name', 'firstName');
    });

    it('should create extended representations', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();

      J.define(User, 'public', [
        J.Field('firstName')
      ]);
      J.define(User, 'extended', [
          J.Field('lastName')
      ], {extends: 'public'});

      var r = user[J.JIGGLER_KEY];
      r.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.extended.fields[0];
      field.should.have.property('name', 'firstName');
      field = r.extended.fields[1];
      field.should.have.property('name', 'lastName');
    });

    it('should throw if the extended template does not exist', function() {
      var User = function(){};

      J.define(User, 'public', []);

      (function() {
        J.define(User, 'extended', [], {extends: 'undefined'});
      }).should.throw();
    });

    it('should allow extended representations to override base implementations', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);
      J.define(User, 'extended', [
        J.Field('lastName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ], {extends: 'public'});

      var r = user[J.JIGGLER_KEY];
      r.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.extended.fields[1];
      field.should.have.property('name', 'lastName');
      field.should.have.property('formatter');
      field.formatter.should.be.a('function');
    });
  });

  describe('J', function() {
    var User = function() {
      this.firstName = '';
      this.lastName = '';
    };
    var user = new User();

    J.define(User, 'public', []);

    it('should add pojo serializer', function(done) {
      J.as.pojo(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });

    it('should add json serializer', function(done) {
      J.as.json(user, 'public', function(err, representation) {
        should.not.exist(err);
        should.exist(representation);
        done();
      });
    });
  });
});