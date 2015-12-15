var J = require('../lib/index')
    , should = require('should')
    , mocha = require('mocha');

describe('Jiggler', function() {

  describe('define', function() {
    it('should define fields in a representation', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define('user_public', [
        J.Field('firstName')
      ]);


      J.templates('user_public').should.have.property('fields').with.lengthOf(1);
      var field = J.templates('user_public').fields[0];
      field.should.have.property('name', 'firstName');
    });

    it('should create extended representations', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define('user_public', [
        J.Field('firstName')
      ]);

      J.define('user_extended', [
          J.Field('lastName')
      ], {extends: 'user_public'});

      J.templates('user_extended').should.have.property('fields').with.lengthOf(2);
      var field = J.templates('user_extended').fields[0];
      field.should.have.property('name', 'firstName');
      field = J.templates('user_extended').fields[1];
      field.should.have.property('name', 'lastName');
    });

    it('should create extended representations with a path as template name', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define('user.public', [
        J.Field('firstName')
      ]);

      J.define('user.extended', [
        J.Field('lastName')
      ], {extends: 'user.public'});

      J.templates('user.extended').should.have.property('fields').with.lengthOf(2);
      var field = J.templates('user.extended').fields[0];
      field.should.have.property('name', 'firstName');
      field = J.templates('user.extended').fields[1];
      field.should.have.property('name', 'lastName');
    });

    it('should throw if the extended template does not exist', function() {
      var User = function(){};

      J.define('user_public', []);

      (function() {
        J.define('user_extended', [], {extends: 'undefined'});
      }).should.throw();
    });

    it('should allow extended representations to override base implementations', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);
      J.define('user_extended', [
        J.Field('lastName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ], {extends: 'user_public'});

      J.templates('user_extended').should.have.property('fields').with.lengthOf(2);
      var field = J.templates('user_extended').fields[1];
      field.should.have.property('name', 'lastName');
      field.should.have.property('formatter');
      field.formatter.should.be.a('function');
    });
  });

  describe('getTemplateWildcard', function() {
      it('should retrieve properly in various cases', function() {
        J.define('test.user.public._2._3', [
          J.Field('firstName_2_3'),
          J.Field('lastName')
        ]);
        J.define('test.user.public.*._3', [
          J.Field('firstName_*_3'),
          J.Field('lastName')
        ]);
        J.define('test.user.public._1._3', [
          J.Field('lastName_1_3', {
            formatter: function(value) {
              return value.charAt(0);
            }
          })
        ], {extends: 'test.user.public._2._3'});

        J.define('test.user.public._4._3', [
          J.Field('firstName_4_3'),
          J.Field('lastName')
        ]);

        J.define('test.user.public._4.*', [
          J.Field('firstName_4_*'),
          J.Field('lastName')
        ]);

        // test fallback template
        J.define('*.*.*.*.*', [
          J.Field('firstName_*_*'),
          J.Field('lastName')
        ]);

        J.templatesWildcard('test.user.public._2._3').fields[0].should.have.property('name','firstName_2_3')
        J.templatesWildcard('test.user.public._5._3').fields[0].should.have.property('name','firstName_*_3')
        J.templatesWildcard('test.user.public._1._3').fields[2].should.have.property('name','lastName_1_3')
        J.templatesWildcard('test.user.public._4._3').fields[0].should.have.property('name','firstName_4_3')
        J.templatesWildcard('test.user.public._4._5').fields[0].should.have.property('name','firstName_4_*')
        J.templatesWildcard('bleh.blah.bloeh.blih.bloh').fields[0].should.have.property('name','firstName_*_*')

      })


  })

  describe('as', function() {
    it('should require a valid template name', function() {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      J.define('user_public', []);

      (function() {
        var user = new User();
        J.as('alternative',user, function() { });
      }).should.throw();
    });

    it('should accept optional arguments', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      J.define('user_public', []);

      var user = new User();
      J.as('user_public',user, {}, function(err, rep) {
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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      J.as('user_public',user, function(err, rep) {
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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('car')
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('car');

        done();
      });
    });

    it('should represent an object property with a template', function(done) {
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

      J.define('car_public', [
        J.Field('make')
      ]);

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('car', {template: 'car_public'})
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'Davos');
        rep.should.have.property('car');
        rep.car.should.not.have.property('year');
        rep.car.should.have.property('make', 'BMW');

        done();
      });
    });

    it('should require an existing template for an object property', function() {
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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('car', {template: 'something_bad'})
      ]);
      J.define('car_public', [
        J.Field('make')
      ]);

      (function() {
        J.as('user_public',user, function(err, rep) {

        });
      }).should.throw('A template named "something_bad" is not defined');
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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('car', {template: 'car_different'})
      ]);
      J.define('car_different', []);

      J.as('user_public',user, function(err, rep) {
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
      J.define('user_public', fields);

      J.as('user_public',[user, user2], function(err, rep) {
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

      J.define('user_public', [
        J.Field('test')
      ]);

      J.as('user_public',user, function(err, rep) {
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

      J.define('user_public', [
        J.Field('firstName', {
          formatter: function(value) {
            return value.charAt(0);
          }
        })
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firstName', 'D');

        done();
      });
    });

    it('should map a representation to a src property via a string argument', function(done) {
      var User = function() {
        this.firstName = '';
      };
      var user = new User();
      user.firstName = 'Davos';

      J.define('user_public', [
        J.Field('firsty', 'firstName')
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('firsty', 'Davos');

        done();
      });
    });

    it('should represent an instance with a src function', function(done) {
      var User = function() {
        this.firstName = '';
      };
      var user = new User();
      user.firstName = 'Davos';

      J.define('user_public', [
        J.Field('relationship', {
          src: function(object, context, callback) {
            callback(null, 'friend')
          }
        })
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('relationship', 'friend');

        done();
      });
    });

    it('should allow context to be sent to a src function', function(done) {
      var User = function() {
        this.firstName = '';
      };
      var user = new User();
      user.firstName = 'Davos';

      J.define('user_public', [
        J.Field('relationship', {
          src: function(object, context, callback) {
            should.exist(context);
            context.should.have.property('ctx', 'value');
            callback(null, 'friend')
          }
        })
      ]);

      J.as('user_public',user, {context: {ctx: 'value'}}, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);
        done();
      });
    });

    it('should not call formatter if the value is undefined', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
      };
      var user = new User();
      user.firstName = undefined;
      user.lastName = 'Seaworth';

      var calledFormatter = false;
      J.define('user_public', [
        J.Field('firstName', {
          formatter: function(value) {
            calledFormatter = true;
            return value.charAt(0);
          }
        })
      ]);

      J.as('user_public',user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        calledFormatter.should.equal(false);

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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      J.as('user_public',user, function(err, rep) {
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

      J.define('user_public', [
        J.Field('firstName'),
        J.Field('lastName')
      ]);

      J.as('user_public',user, {stripUndefined: false}, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        ('firstName' in rep).should.equal(true);
        should.equal(undefined, rep.firstName);
        rep.should.have.property('lastName');

        done();
      });
    });
  });

  describe('converters', function(){
    it('should have converters', function() {
      J.should.have.property('convert');
      J.convert.should.have.property('underscore');
      J.convert.underscore.should.be.function;
    });

    it('should convert camelCase to underscore', function(done) {
      var User = function() {
        this.firstName = '';
        this.lastName = '';
        this.homeAddress = {};
        this.highSchools = [];
      };
      var user = new User();
      user.firstName = 'Davos';
      user.lastName = 'Seaworth';
      user.homeAddress = {
        streetLine1: 'test',
        streetLine2: 'test 2'
      };
      user.highSchools.push({
        graduationYear: 2001
      });
      user.highSchools.push({
        graduationYear: 2010
      });

      J.convert.underscore(user, function(err, rep) {
        should.not.exist(err);
        should.exist(rep);

        rep.should.have.property('first_name', 'Davos');
        rep.should.have.property('last_name', 'Seaworth');
        rep.should.have.property('home_address');
        rep.home_address.should.have.property('street_line1', 'test');
        rep.home_address.should.have.property('street_line2', 'test 2');
        rep.should.have.property('high_schools');
        rep.high_schools.should.be.instanceOf(Array);
        rep.high_schools[0].should.have.property('graduation_year', 2001);
        done();
      });
    });
  });
});