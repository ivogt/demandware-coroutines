

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

var RetryFunction = require('../core/retry');
var OKFunction = require('../core/ok');
var Retry = new RetryFunction();
var OK = new OKFunction();
var isDirective = function Directive$Continued$isDirective(o){
	return (!!o && typeof(o) === "object" && ('__isDirective' in o))
};
function drainArray (obj, list , context){
	var itemIndex,next;
	for( itemIndex in list){
		
		var cbCurrent = list[itemIndex];
		if(!isGeneratorIterator(cbCurrent) && !isGeneratorFunction(cbCurrent)) {
			cbCurrent.call(obj, context);
			continue;
		}
		
		let stack =[],current=0,next=cbCurrent,response;
        for(let i=0;;i++){
        	try{
        		if(isGeneratorFunction(next)) {
        			current = stack.push(next.call(obj, context)) -1;
        			next = stack[current].next();// start
        			continue;
        		}
        		if(isGeneratorIterator(next)){
        			response = yield next;
        			//continue;
        		}
        		if(isDirective(next)){
        			//send for execution
        			response = yield next;
        		}else{
        			//handle normally
        			response = next;
        			
        			if( Retry.isRetry(next) || OK.isOK(next)  ){
        				yield next;
        				break;
        			}
        		}
        		next = stack[current].send(response);
        	}catch(e if e instanceof StopIteration){
        		current--;
				let removed = stack.pop();
                if(current <0){
                	break;
                }else{
                	next = stack[current].send(response); // call before we re-run
                	continue;
                }
        	}
        }//for 2
	}//for 1
}//func

var slice = [].slice;
var URLUtils = require('dw/web/URLUtils');
module.exports = {
		"URL" : {
			Action : function Directive$Continued$action (){
				var params = slice.call(arguments)
				return "directive_action_" + params.join('_');
			},
			Continue : function Directive$Continued$continue (){
				return URLUtils.continueURL();
			}
		},
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
					submitResult = yield drainArray(this.scope, submitHandlers, submittedParams);
					if(Retry.isRetry(actionResult)) { continue;};
					if(Retry.isRetry(submitResult)) { continue;};
					if(OK.isOK(submitResult) || OK.isOK(actionResult)) { throw StopIteration;};
					
			}
		},
 
};