var CausedByError = function( e , message) {
	var err = {};
	try {
		if(e instanceof Error) {
			err = e
		}else throw new Error(e);
	} catch (e) {
		err = e
	}
	err.name = 'CausedByError';
	this.name = err.name;
	this.message = [err.message];
	if(!!message) this.message.splice(0,0,message);
	if (err.stack) {
		this.stack = err.stack;
	}
	//we should define how our toString function works as this will be used internally
	//by the browser's stack trace generation function
	this.toString = function() {
		return this.name  + ': ' + this.message.join("\n ") + "\n";
				
	};
};
CausedByError.prototype = new Error();
CausedByError.prototype.name = 'CausedByError';
function _try (expression){
	try {
		return expression();
	}catch(e){
		return { error : e};
	}
};



var AssertionError = function( e , message) {
	var err = {};
	try {
		if(e instanceof Error) {
			err = e
		}else throw new Error(e);
	} catch (e) {
		err = e
	}
	err.name = 'AssertionError';
	this.name = err.name;
	this.message = err.message || ' No message was provided! How silly!??';
	if (err.stack) {
		this.stack = err.stack;
	}
	//we should define how our toString function works as this will be used internally
	this.toString = function() {
		return this.name  + ': ' + this.message + "\n";
				
	};
};
AssertionError.prototype = new Error();
AssertionError.prototype.name = 'AssertionError';




module.exports._try = _try;
module.exports.CausedByError = CausedByError;
module.exports.AssertionError = AssertionError;