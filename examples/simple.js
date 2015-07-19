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