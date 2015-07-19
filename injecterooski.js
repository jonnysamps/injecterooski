/**
 * Primary require point for Injecterooski.  Exposes all of the rest of the classes to
 * users of the library.
 *
 * @type {{AppContext: exports}}
 */
module.exports = {
    AppContext: require('./src/AppContext.js')
}