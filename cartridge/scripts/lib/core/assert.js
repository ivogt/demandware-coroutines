var AssertionError = require('./custom-errors').AssertionError;
function assert(message,condition) {
    if (!condition) {
        message = message || "Assertion failed";
        throw new AssertionError(message);
    }
}

module.exports = assert;