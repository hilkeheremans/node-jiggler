var J = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('Jiggler', function() {

  describe('define', function() {
    it('should add representations to a class', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define(User, 'public', []);

      User.should.have.property(J.JIGGLER_KEY);
      var r = User[J.JIGGLER_KEY];
      r.should.have.property('as');
      r.as.should.be.a('object');
      r.as.public.should.be.a('function');
      r.should.have.property('templates');
      r.templates.should.be.a('object');
      r.templates.public.should.be.a('object');
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

      J.define(User, 'public', [
        J.Field('firstName')
      ]);


      var r = User[J.JIGGLER_KEY];
      r.templates.public.should.have.property('fields').with.lengthOf(1);
      var field = r.templates.public.fields[0];
      field.should.have.property('name', 'firstName');
    });

    it('should create extended representations', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define(User, 'public', [
        J.Field('firstName')
      ]);
      J.define(User, 'extended', [
          J.Field('lastName')
      ], {extends: 'public'});

      var r = User[J.JIGGLER_KEY];
      r.templates.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.templates.extended.fields[0];
      field.should.have.property('name', 'firstName');
      field = r.templates.extended.fields[1];
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

      var r = User[J.JIGGLER_KEY];
      r.templates.extended.should.have.property('fields').with.lengthOf(2);
      var field = r.templates.extended.fields[1];
      field.should.have.property('name', 'lastName');
      field.should.have.property('formatter');
      field.formatter.should.be.a('function');
    });
  });

  describe('as', function() {
    it('should require a valid template name', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      J.define(User, 'public', []);

      (function() {
        var user = new User();
        User[J.JIGGLER_KEY].as.alternative(user, function() { });
      }).should.throw();
    });

    it('should accept optional arguments', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      J.define(User, 'public', []);

      var user = new User();
      User[J.JIGGLER_KEY].as.public(user, {}, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);
        done();
      });
    });

    it('should represent an instance with simple properties', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('lastName', 'Seaworth');

        done();
      });
    });

    it('should represent an instance with object properties', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = 'Davos';
      user.car = {
        year: 2001,
        make: 'Ford'
      };

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('car')
      ]);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('car');

        done();
      });
    });

    it('should represent an instance property with an alternative template', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var Car = function() {
        this.year = 2012;
        this.make = '';
      };
      var user = new User();
      user.firstName = 'Davos';
      var car = new Car();
      car.make = 'BMW';
      user.car = car;

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('car', {template: 'different'})
      ]);
      J.define(Car, 'different', []);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('car');
        rep.car.should.not.have.property('year');
        rep.car.should.not.have.property('make');

        done();
      });
    });

    it('should represent an array', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';
      var user2 = new User();
      user2.firstName = 'Sandor';
      user2.lastName = 'Clegane';

      var fields = [
        J.Field('firstName'),
        J.Field('lastName')
      ];
      J.define(User, 'public', fields);

      User[J.JIGGLER_KEY].as.public([user, user2], function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.be.an.instanceOf(Array);
        rep.should.have.lengthOf(2);
        rep[0].should.have.property('firstName', 'Davos');
        rep[0].should.have.property('lastName', 'Seaworth');
        rep[1].should.have.property('firstName', 'Sandor');
        rep[1].should.have.property('lastName', 'Clegane');

        done();
      });
    });

    it('should represent an instance with an array property', function(done) {
      var User = function() {
      };
      var user = {
        test: ['one', 'two']
      };

      J.define(User, 'public', [
        J.Field('test')
      ]);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('test').with.lengthOf(2);
        rep.test.should.include('one');
        rep.test.should.include('two');

        done();
      });
    });

    it('should represent an instance with a formatter', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';

      J.define(User, 'public', [
        J.Field('firstName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ]);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'D');

        done();
      });
    });

    it('should strip undefined values by default', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = undefined;
      user.lastName = 'Seaworth';

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      User[J.JIGGLER_KEY].as.public(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        ('firstName' in rep).should.equal(false);
        rep.should.have.property('lastName');

        done();
      });
    });

    it('should not strip undefined values if stripUndefined is set to false', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = undefined;
      user.lastName = 'Seaworth';

      J.define(User, 'public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      User[J.JIGGLER_KEY].as.public(user, {stripUndefined: false}, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        ('firstName' in rep).should.equal(true);
        should.equal(undefined, rep.firstName);
        rep.should.have.property('lastName');

        done();
      });
    });
  });
});