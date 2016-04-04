/**
 * Created by jonathansamples on 2/12/15.
 */
function AppContext(){
    this.beans = {};

}

AppContext.instance = function(){
    return new AppContext();
}

/**
 * Registers each object that should be managed by the application context
 * @param bean
 * @param name - Optional
 */
AppContext.prototype.register = function(beans, name){
    if(!Array.isArray(beans))
        beans = [beans];

    for(var i in beans){
        var bean = beans[i];
        var deps = [];

        if(bean.inject)
            deps = AppContext.getDependencies(bean.inject)

        var beanMeta = {
            object: bean,
            deps: deps,
            injected: false,
            initialized: false,
            finalized: false
        };

        /**
         * Register the bean under a custom name if needed
         */
        if(name)
            this.beans[name.toLowerCase()] = beanMeta;
        /**
         * Register the bean under its classname
         */
        this.beans[bean.constructor.name.toLowerCase()] = beanMeta;
    }
}

/**
 * Will take the context through initialization
 */
AppContext.prototype.resolve = function(){
    this.wire();
    this.initialize();
    this.finalize();
}

/**
 * Will run through each bean, find it's dependencies and inject them
 */
AppContext.prototype.wire = function(){
    for(var name in this.beans){
        var beanMeta = this.beans[name];

        /**
         * Make sure we don't do this more than once in case the bean is registered more than once
         */
        if(!beanMeta.injected){
            var deps = []
            for(var i in beanMeta.deps){
                var depName = beanMeta.deps[i].toLowerCase();
                var dep = this.beans[depName]?this.beans[depName].object:null;

                if(!dep){
                    throw new Error('Dependency Injection Failed: missing dependency ('+depName+') for bean ('+name+')')
                }
                else{
                    deps.push(dep);
                }
            }

            /**
             * We've found all of the dependencies... now inject them
             */
            if(beanMeta.object.inject){
                /**
                 * We have to use eval because don't have any way to dynamically pass a
                 * variable number of arguments to a function... in ES5.... just wait for ES6!
                 */
                var argString = '';
                for(var i = 0; i < deps.length; i++){
                    if(i !== 0) argString += ","
                    argString += "deps["+i+"]";
                }
                var evalString = 'beanMeta.object.inject('+argString+')';
                eval(evalString);
            }

            beanMeta.injected = true;
        }
    }
}

/**
 * Run through and call init on each bean
 */
AppContext.prototype.initialize = function(){
    for(var key in this.beans){
        var beanMeta = this.beans[key];
        if(!beanMeta.initialized){
            if(beanMeta.object.init)
                beanMeta.object.init();

            beanMeta.initialized = true;
        }
    }
}

/**
 * Run through and call finalize on each bean
 */
AppContext.prototype.finalize = function(){
    for(var key in this.beans){
        var beanMeta = this.beans[key];
        if(!beanMeta.finalized){
            if(beanMeta.object.finalize)
                beanMeta.object.finalize();

            beanMeta.finalized = true;
        }
    }
}

/**
 * Will look for an object in the context that matches the passed in name or type or object
 * @param nameOrType - a String or a constructor to look up the object
 */
AppContext.prototype.get = function(nameOrType){
    var result = null;
    var key = null;
    if(typeof nameOrType == "string" || nameOrType instanceof String)
        key = nameOrType;
    else if(nameOrType && nameOrType.name)
        key = nameOrType.name;
    else if(nameOrType.constructor && nameOrType.constructor.name)
        key = nameOrType.constructor.name;


    if(key){
        key = key.toLowerCase();
        var beanMeta = this.beans[key];
        if(beanMeta)
            result = beanMeta.object
    }

    return result;
}

/**
 * Stolen from Angular :) and adapted
 * @type {RegExp}
 */
//var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var CLASS_ARGS = /^[^\(]*constructor\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
AppContext.getDependencies = function(fn) {
    var deps,
      fnText,
      argDecl;

    if (typeof fn == 'function') {
        // Need to see if it is a ES6 class
        var isES6Class = fn.toString().indexOf('class') === 0
        deps = [];
        fnText = fn.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(isES6Class ? CLASS_ARGS : FN_ARGS);
        if(argDecl !== null && argDecl.length > 0)
            argDecl[1].split(FN_ARG_SPLIT).map(function(arg){
                arg.replace(FN_ARG, function(all, underscore, name){
                    deps.push(name);
                });
            });
    }

    return deps;
}

module.exports = AppContext;
