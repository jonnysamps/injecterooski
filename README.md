Injecterooski
=============

A plain javascript dependency injection framework for Node. It is named after one of my favorite plays in football the 'Fumblerooski' 
where the ball is continually fumbled in a last ditch effort to score and win the game. It rarely works.  With dependency injection
we want to define the interfaces that we depend on but not be responsible for fulfilling them so it felt like there
was a connection to the 'Fumblerooski' somehow... don't dig too deep... in particular don't draw parallels to the "it rarely works" part.

Project Goals
-------------
I looked around the web for a Node dependency injection framework that was simple to use and fit with my idea of how DI
should work.  I didn't find one that I liked perfectly so here is my attempt at fulfilling my own need.

I want a DI framework and thus this project to:

* **Allow for plain javascript class dependencies**
  I don't want to be required to inherit from some superclass to get DI to work or have to learn some DSL
* **Do injection at the object level (not module level)**
  Doing module level DI doesn't really make sense to me (unless each module is a class)
* **Define dependencies through class declaration (not through a config file)**
  The framework should do it's best to discover which classes rely on which other classes without the need for 
  special configuration.
* **Define application context (the group of objects that have and fulfill each others' dependencies) in javascript.**
  No XML, just plain javascript so the developer can take advantage of the DI but also do whatever the heck they need to 
  do to get their work done.

There are probably more but I can't think of them at the moment.

Usage Examples
--------------

### Simple Example

Say you have only have an `EmailService` that depends on a `Logger`. You would:
 
* Create the app context and the objects that should be maintained by the DI framework
* Register them with the app context
* Tell the context to resolve all the dependencies
* And then use your objects with all of their dependencies satisfied

```javascript
// Copied from examples/simple.js
// Class Definitions inline for readability
function EmailService(){
    this.logger = null;
}
// Classes are required by Injecterooski to have an `inject` member function in order to have dependencies injected
EmailService.prototype.inject = function(logger) {
    this.logger = logger
};
EmailService.prototype.sendMail = function(to, message){
    this.logger.log("Sending Email to: "+to+" with message: "+message);
    // ... Use your imagination here
};

// Logger has no inject method because it doesn't have any dependencies
function Logger(){}
Logger.prototype.log = function(message){
    console.log(message)
}

var injecterooski = require('../injecterooski');

// Create the app context
var appContext =  new injecterooski.AppContext();

// Create your objects
var logger = new Logger(),
    emailService = new EmailService();

// Register your objects
appContext.register([
    logger,
    emailService
]);

// Tell the app context to resolve them.
appContext.resolve();

// Now just use your email service
emailService.sendMail('yo@mama.org','So fat when she sits around the house she REALLy sits around the house');
```

Granted this example is very contrived (as are all library/framework examples) but you can see the point here: create
the objects and define their interfaces to one another but DON'T hardwire the dependencies to one another. Instead 
Allow a third part to wire them together so that you can create other applications that are wired up differently (like
tests) and be able to re-use the code you've already written.

Resolution Phases
-----------------

Injecterooski offers some initialization sugar to go with your injected iced tea. Since many objects have complicated 
construction and initialization the framework offers three hook points for your objects:

* **`inject`**
  Your class can implement an inject method that the framework will use to determine dependencies and inject said
  dependencies.
* **`initialize`**
  Your class can implement an `initialize` method with empty arguments to run any init logic that needs to be run. At this
  point all objects are guaranteed to be injected.
* **`finalize`**
  Your class can implement a `finalize` method with empty arguments to run any finalization logic that needs to be run. 
  All injection and initialization is guaranteed to have been done at this point.
  
There is no guarantee about which order each of these phases will occur for a given object in the app context.

Caveats
-------
* Class constructor functions must be named otherwise auto construction will not work. In other words if you have the 
situation where `A` depends on `B` but `B` is defined like 

```javascript
var B = function(){
  ...
}
```

Injecterooski will fail to find an object with type `B` because it's constructor is anonymous. You can either change it to

```javascript 
function B(){
  ... 
}
```

Or if you don't have a choice about it's construction (because its a third party object) then you can pass it's name to 
Injecterooski at object registration e.g.

```javascript
appContext.register(new B(), 'B')
```

Running Tests
-------------
```bash
> npm test
```

Future Features
---------------
* It would be nice to have dependency lists

Contributing
------------
If you like to contribute please fork and send me a PR.