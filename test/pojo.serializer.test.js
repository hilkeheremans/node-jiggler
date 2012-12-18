var represent = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('POJO Serializer', function() {
  var User = function() {
    this.firstName = '';
    this.lastName = '';
  };
  var Car = function() {
    this.year = 2012;
    this.make = '';
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

  it('should represent an instance with object properties', function(done) {
    var user = new User();
    user.firstName = 'Davos';
    user.car = {
      year: 2001,
      make: 'Ford'
    };

    represent.define(user, 'public', [
      represent.Field('firstName'),
      represent.Field('car')
    ]);

    represent.as.pojo(user, 'public', function(err, rep) {
      should.not.exist(err);
      should.exist(rep);

      rep.should.have.property('firstName', 'Davos');
      rep.should.have.property('car');

      done();
    });
  });

  it('should represent an instance with templated object properties', function(done) {
    var user = new User();
    user.firstName = 'Davos';
    var car = new Car();
    car.make = 'BMW';
    user.car = car;

    represent.define(user, 'public', [
      represent.Field('firstName'),
      represent.Field('car')
    ]);
    represent.define(car, 'public', []);

    represent.as.pojo(user, 'public', function(err, rep) {
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
    var user = new User();
    user.firstName = 'Davos';
    user.lastName = 'Seaworth';
    var user2 = new User();
    user2.firstName = 'Sandor';
    user2.lastName = 'Clegane';

    var fields = [
      represent.Field('firstName'),
      represent.Field('lastName')
    ];
    represent.define(user, 'public', fields);
    represent.define(user2, 'public', fields);

    represent.as.pojo([user, user2], 'public', function(err, rep) {
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

  it('should strip undefined values by default', function(done) {
    var user = new User();
    user.firstName = undefined;
    user.lastName = 'Seaworth';

    represent.define(user, 'public', [
      represent.Field('firstName'),
      represent.Field('lastName')
    ]);

    represent.as.pojo(user, 'public', function(err, rep) {
      should.not.exist(err);
      should.exist(rep);

      ('firstName' in rep).should.equal(false);
      rep.should.have.property('lastName');

      done();
    });
  });

  it('should not strip undefined values if stripUndefined is set to false', function(done) {
    var user = new User();
    user.firstName = undefined;
    user.lastName = 'Seaworth';

    represent.define(user, 'public', [
      represent.Field('firstName'),
      represent.Field('lastName')
    ]);

    represent.as.pojo(user, 'public', {stripUndefined: false}, function(err, rep) {
      should.not.exist(err);
      should.exist(rep);

      ('firstName' in rep).should.equal(true);
      should.equal(undefined, rep.firstName);
      rep.should.have.property('lastName');

      done();
    });
  });
});