

/**
  This mixin allows for CO objects to subscribe and emit events.
  @class Evented
  @namespace CO
 */

function isGeneratorIterator ( o ) {
	if( typeof(o)!=="object" ) return false;
	if( !('toString' in o) ) return false;
	return o.toString() == "[object Generator]" ? true : false;  
}
function isGeneratorFunction(obj){
    if(typeof(obj) == "function"){
        return (obj.toString().indexOf("yield") !== -1);
    }
    return false;
} 
var assert = require('../core/assert');
var slice = [].slice;

function castParamsToObject (httpParameters){
	let actionPrefix = "directive";
	let param,casted = { action : []},params=httpParameters;
	for(param in params){
		let [value] = params[param];//destructure to [0]
		casted[param] = value;
		let [directive,action] = param.split('_');
		if(directive == "directive" && action == "action"){
			casted['action'] = param.split('_').slice(2);
		}
	}
	return casted;
}


function RetryFunction(){}
RetryFunction.prototype.toString = function (){
	return "[Object Retry]"
}
RetryFunction.prototype.isRetry = function (obj){
	return false;
}
function OKFunction(){
	this.toString = function (){return "[Object OK]"}
}
var Retry = new RetryFunction();
var OK = new OKFunction();
function drainArray (obj, list , context){
	var itemIndex,next;
	for( itemIndex in list){
		var cbCurrent = list[itemIndex];
		if(!isGeneratorIterator(cbCurrent) && !isGeneratorFunction(cbCurrent)) {
			cbCurrent.call(obj, context);
			continue;
		}
		next =yield cbCurrent.call(obj, context);
		if(Retry.isRetry(next)){
			yield Retry;
			break;
		}
		if(typeof(next) === "object" && next instanceof OKFunction){
			throw StopIteration; // halt drain for this directive; 
		}
		
	}
}
module.exports = {
		
		use : function (cb){
			this.on('use',cb);
			return this;
		},
		init : function Directive$Continued$init(){
			this.scope.retry = function Directive$retry(){ return Retry;};
			this.scope.ok = function Directive$ok(){ return OK;};
			let params = [].slice.call(arguments);
			this._super.call(this,params);
		},
		handle : function Directive$Continued$handle(cb){
			
			assert("Directive-continued$handle(cb) supports only functions as callback to handle Events.\n Events will always be binded to the Directive's scope!",
					typeof(cb) === "function")

			this.on("submit",cb);
			var uses = this.getEventListeners('use');
			yield drainArray(this.scope, uses,null);
			
			let submitHandlers = this.getEventListeners('submit');
			let result,submitResult,actionResult;
			for(;;){ 
				result = yield this; // call event loop with Directive forever :)
				let submittedParams = castParamsToObject(result);
				let [action] = submittedParams['action'];
				let actionHandlers = this.getEventListeners(action);
					actionResult = yield drainArray(this.scope, actionHandlers, submittedParams);
					if(Retry.isRetry(actionResult)) { trace("will retry"); continue;};
					//submitResult = yield drainArray(this.scope, submitHandlers, submittedParams);
					if(Retry.isRetry(submitResult)) {trace("will retry2");continue;};
					
			}
			throw new Error("Directive-continued must be resolved during handle call");
		},
 
};