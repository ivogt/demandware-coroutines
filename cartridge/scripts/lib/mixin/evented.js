

/**
  This mixin allows for CO objects to subscribe and emit events.
  @class Evented
  @namespace CO
 */


  
var assert = require('../core/assert');
var slice = [].slice;

function addListener(obj, eventName, fn) {
	assert("You must pass context,event name and callback to Evented.addListener", 
			!!obj && !!eventName && (typeof(fn) == 'function'));

	var events = obj.__eventlisteners__ = obj.__eventlisteners__  || {};
	if(!(!!events[eventName] && events[eventName].constructor.name === 'Array')) events[eventName]=[];
	events[eventName].push(fn);
	return obj;
}

function one(obj,eventName, fn) {
	assert("You must pass context,event name and callback to Evented.one", !!obj && !!eventName && (typeof(fn) == 'function'));

	var fnc = function Evented$one() {
		removeListener(obj,eventName, fnc);
		fn.apply(this, slice.call(arguments));
	};
	this.addListener(obj,eventName, fnc);
	return this;
}

function removeListener(obj,eventName, fn) {
	assert("You must pass context,event name and callback to Evented.removeListener", !!obj && !!eventName && (typeof(fn) == 'function'));

	var index,events = obj.__eventlisteners__;
	if (!events) return;
	index = (fn) ? _indexOf(events[eventName], fn) : 0;
	if (index !== -1) {
		events[eventName].splice(index, 1);
	}
	return obj;
}

function sendEvent(obj,event) {
	var args, i;
	var events = obj.__eventlisteners__;
	if (!events || event in events === false) return;
	args = slice.call(arguments, 2);
	for (i = events[event].length - 1; i >= 0; i--) {
		events[event][i].apply(obj, args);
	}
	return this;
}
function getListeners (obj,eventName){
	assert("You must pass event name to Evented.geListeners", !!obj && !!eventName);
	var events = obj.__eventlisteners__
	if (!events) return [];
	if(!!events[eventName] && events[eventName].length > 0) return events[eventName];
	return [];
}
function hasListeners (obj,eventName){
	assert("You must pass context and event name  to Evented.hasListeners", !!obj && !!eventName);
	var events = obj.__eventlisteners__
	if (!events) return false;
	if(!!events[eventName] && events[eventName].length > 0) return true;
	return false;
}
function _indexOf(array, needle) {
	return array.indexOf(needle);
}

  
  
module.exports = {


  getEventListeners: function(name) {
	 return getListeners(this,name);
  },

  /**
   Subscribes to a named event with given function.
   ```javascript
   person.on('didLoad', function() {
     // fired once the person has loaded
   });
   ```
   An optional target can be passed in as the 2nd argument that will
   be set as the "this" for the callback. This is a good way to give your
   function access to the object triggering the event. When the target
   parameter is used the callback becomes the third argument.
   @method on
   @param {String} name The name of the event
   @param {Object} [target] The "this" binding for the callback
   @param {Function} method The callback to execute
   @return this
  */
  on: function(name, method) {
    addListener(this, name, method);
    return this;
  },

  /**
    Subscribes a function to a named event and then cancels the subscription
    after the first time the event is triggered. It is good to use ``one`` when
    you only care about the first time an event has taken place.
    This function takes an optional 2nd argument that will become the "this"
    value for the callback. If this argument is passed then the 3rd argument
    becomes the function.
    @method one
    @param {String} name The name of the event
    @param {Object} [target] The "this" binding for the callback
    @param {Function} method The callback to execute
    @return this
  */
  one: function(name, method) {
    if (!method) {
      method = target;
      target = null;
    }

    one(this, name, method);
    return this;
  },

  /**
    Emits a named event for the object. Any additional arguments
    will be passed as parameters to the functions that are subscribed to the
    event.
    ```javascript
    person.on('didEat', function(food) {
      console.log('person ate some ' + food);
    });
    person.emit('didEat', 'broccoli');
    // outputs: person ate some broccoli
    ```
    @method trigger
    @param {String} name The name of the event
    @param {Object...} args Optional arguments to pass on
  */
  emit: function(name) {
    var length = arguments.length;
    var args = new Array(length - 1);

    for (var i = 1; i < length; i++) {
      args[i - 1] = arguments[i];
    }

    sendEvent(this, name, args);
  },


  /**
    Cancels subscription for given name, target, and method.
    @method off
    @param {String} name The name of the event
    @param {Object} target The target of the subscription
    @param {Function} method The function of the subscription
    @return this
  */
  off: function(name, method) {
    removeListener(this, name, method);
    return this;
  },

  /**
    Checks to see if object has any subscriptions for named event.
    @method has
    @param {String} name The name of the event
    @return {Boolean} does the object have a subscription for event
   */
  has: function(name) {
    return hasListeners(this, name);
  }
};