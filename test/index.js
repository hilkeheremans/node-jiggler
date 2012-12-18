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

      represent.define(User, 'public', {

      });

      var newUser = new User();
      newUser.should.have.property('_represent');
      var r = newUser._represent;
      r.public.should.be.a('function');
    });

    it('should add representations to an instance', function() {
      var user = {
        firstName: '',
        lastName: ''
      };

      represent.define(user, 'public', {

      });

      user.should.have.property('_represent');
      var r = user._represent;
      r.public.should.be.a('function');
    });
  });

  describe('represent', function() {
    var user = {
      firstName: '',
      lastName: ''
    };

    represent.define(user, 'public', {

    });

    it('should represent an instance', function(done) {
      represent.as.json(user, 'public', function(err, representation) {
        done();
      });
    });
  });
});