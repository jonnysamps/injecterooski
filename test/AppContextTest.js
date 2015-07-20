var AppContext = require('../src/AppContext'),
    expect = require('chai').expect;

describe('AppContext', function(){

    var ac = null;
    beforeEach(function(){
        ac = AppContext.instance();
    });

    describe('#getDependencies', function(){
        it('should return the list of function argument names', function(){
            var fn = function(mary, had, a, little, lamb){};
            var deps = AppContext.getDependencies(fn);

            expect(deps).to.have.length(5);

            expect(deps[0]).to.equal('mary');
            expect(deps[1]).to.equal('had');
            expect(deps[2]).to.equal('a');
            expect(deps[3]).to.equal('little');
            expect(deps[4]).to.equal('lamb');
        });

        it('should return an empty list when no arguments', function(){
            var fn = function(){};
            var deps = AppContext.getDependencies(fn);

            expect(deps).to.have.length(0);
        });


    });

    describe('#wire', function(){
        it('should wire dependencies', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            ac.register(obj1);
            ac.register(obj2);
            ac.register(obj3);

            ac.wire();

            expect(obj1).to.have.property('obj2', obj2);
            expect(obj1).to.have.property('obj3', obj3);
            expect(obj2).to.have.property('obj1', obj1);
            expect(obj1).to.have.property('obj3', obj3);
            expect(obj3).to.have.property('obj1', obj1);
            expect(obj3).to.have.property('obj2', obj2);

        });

        it('should throw an Error when a dependency cannot be resolved', function(){
            var obj1 = new Obj1();

            ac.register(obj1);

            expect(function(){ac.wire()}).to.throw(Error);
        });

        it('should be able to use a name instead of object constructor name', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3(),
                obj4 = new Obj4();

            ac.register(obj1,'o');
            ac.register(obj2);
            ac.register(obj3);
            ac.register(obj4);

            ac.wire();

            expect(obj1).to.have.property('obj2', obj2);
            expect(obj1).to.have.property('obj3', obj3);
            expect(obj2).to.have.property('obj1', obj1);
            expect(obj1).to.have.property('obj3', obj3);
            expect(obj3).to.have.property('obj1', obj1);
            expect(obj3).to.have.property('obj2', obj2);
            expect(obj4).to.have.property('o', obj1);
        });
    });

    describe('#initialize', function(){
        it('should call init on all objects that have an `init` function defined and only once', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            var obj1Inited = 0;
            obj1.init = function(){
                obj1Inited++;
            }

            var obj2Inited = 0;
            obj2.init = function(){
                obj2Inited++;
            }

            var obj3Inited = 0;
            obj3.init = function(){
                obj3Inited++;
            }

            ac.register(obj1,'p');
            ac.register(obj2,'q');
            ac.register(obj3,'r');

            ac.wire();
            ac.initialize();

            expect(obj1Inited).to.equal(1);
            expect(obj2Inited).to.equal(1);
            expect(obj3Inited).to.equal(1);

        });
    });

    describe('#finalize', function(){
        it('should call finalize on all objects that have a `finalize` function defined and only once', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            var obj1Inited = 0;
            obj1.finalize = function(){
                obj1Inited++;
            }

            var obj2Inited = 0;
            obj2.finalize = function(){
                obj2Inited++;
            }

            var obj3Inited = 0;
            obj3.finalize = function(){
                obj3Inited++;
            }

            ac.register(obj1,'p');
            ac.register(obj2,'q');
            ac.register(obj3,'r');

            ac.wire();
            ac.initialize();
            ac.finalize();

            expect(obj1Inited).to.equal(1);
            expect(obj2Inited).to.equal(1);
            expect(obj3Inited).to.equal(1);

        });
    });

    describe('#resolve', function(){
        it('should wire, init and finalize all beans', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            var obj1Inited = 0;
            obj1.finalize = obj1.init = function(){
                obj1Inited++;
            }

            var obj2Inited = 0;
            obj2.finalize = obj2.init = function(){
                obj2Inited++;
            }

            var obj3Inited = 0;
            obj3.finalize = obj3.init = function(){
                obj3Inited++;
            }

            ac.register(obj1,'p');
            ac.register(obj2,'q');
            ac.register(obj3,'r');

            ac.resolve();

            expect(obj1Inited).to.equal(2);
            expect(obj2Inited).to.equal(2);
            expect(obj3Inited).to.equal(2);

        });
    });

    describe('#get', function(){
        it('should return an object that was registered with the name', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            ac.register([
                obj1, obj2, obj3
            ]);
            ac.resolve();

            var o1 = ac.get('Obj1');
            expect(o1).to.equal(obj1);
        });

        it('should return an object that was registered with a constructor name, when querying by object', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            ac.register([
                obj1, obj2, obj3
            ]);
            ac.resolve();

            var o1 = ac.get(obj1);
            expect(o1).to.equal(obj1);
        });

        it('should return an object that was registered with a constructor name, when querying by constructor', function(){
            var obj1 = new Obj1(),
                obj2 = new Obj2(),
                obj3 = new Obj3();

            ac.register([
                obj1, obj2, obj3
            ]);
            ac.resolve();

            var o1 = ac.get(Obj1);
            expect(o1).to.equal(obj1);
        });
    });

});


/**
 * Test Classes
 * @constructor
 */
function Obj1(){
    this.obj2 = null;
    this.obj3 = null;
}
Obj1.prototype.inject = function(obj2, obj3){
    this.obj2 = obj2;
    this.obj3 = obj3;
}

function Obj2(){
    this.obj1 = null;
    this.obj3 = null;
}
Obj2.prototype.inject = function(obj1, obj3){
    this.obj1 = obj1;
    this.obj3 = obj3;
}

function Obj3(){
    this.obj1 = null;
    this.obj2 = null;
}
Obj3.prototype.inject = function(obj1, obj2){
    this.obj1 = obj1;
    this.obj2 = obj2;
}

function Obj4(){
    this.o = null;
}
Obj4.prototype.inject = function(o){
    this.o = o;
}
