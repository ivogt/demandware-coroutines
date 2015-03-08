'use strict';

var assignProperties = require('./core/assign-properties');

function needsNew() {
  throw new TypeError("Failed to construct: Please use the 'new' operator, this object constructor cannot be called as a function.");
}

function CoreObject(options) {
  if (!(this instanceof CoreObject)) {
    needsNew()
  }
  this.init(options);
}

CoreObject.prototype.init = function(options) {
  if (options) {
    for (var key in options) {
      this[key] = options[key];
    }
  }
};

CoreObject.extend = function(options) {
  var constructor = this;

  function Class() {
    var length = arguments.length;

    if (length === 0)      this.init();
    else if (length === 1) this.init(arguments[0]);
    else                   this.init.apply(this, arguments);
  }

  Class.__proto__ = CoreObject;

  Class.prototype = Object.create(constructor.prototype);
  Class.extend = CoreObject.extend;//make extendable ;)
  if (options) assignProperties(Class.prototype, options);
  
  return Class;
};

module.exports = CoreObject;
module.exports.Class = CoreObject;