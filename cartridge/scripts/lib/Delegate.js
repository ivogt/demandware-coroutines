var Class = require('./libInheritance').Class;
var Directive = require('./Directive').Directive;
var isDirective = require('./Directive').isDirective;
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
function padding (str,repeat){
	var str=str;
	for(let i=0;i<repeat;i++) str +=str+"";
	return str;
}
var Delegate = Class.extend({
	name : "Delegate",
	"continue" : false, 
	_pad : "",
	_originalPad : "	>",
	_step : 0,
	_generatorFunction : undefined, 
	_scriptLog : "",
	_startTime : undefined,
	_running : false,
	delegate : undefined,
	log : function (msg){
		trace("delegate [" + this.name + "] "+ this._pad +" " + this._step +" " + msg);
	},
	addScriptLog : function (name , log){
		
		this._scriptLog  += "-------------- Directive " + name + "----------------" 
							+ "\n"; 
		 					+ log 
							+ "\n"
							+ "-------------- END Directive " + name + "----------------" ; 
	},
	init : function ( generator ) {
		var generator = generator;
		if(isGeneratorFunction(generator)){ 
			this._generatorIterator = generator;
			return;
		}
		throw Error("Delegate error: you must construct delegate with GeneratorFunction!");
	},
	run : function (name) {
		this.name = name;
		this._startTime = new Date();
		this.delegate = this.drain(this._generatorIterator);
		this._running = true;
		return this;
	},
	drain : function Delegate$drain ( delegateFunction ) {
		let currentNext=delegateFunction,sended = null,stack =[],current=0,backToPrevious=false,pad="";
        for(let i=0;;i++){
        	let startTime = new Date();
                try{
                    if(backToPrevious){
                        backToPrevious=false;
                        currentNext = stack[current].it.send(sended);
                    	continue;
                	}
                    if(isGeneratorFunction(currentNext)){

                         let it = currentNext.call(this);
                        	current = stack.push({
                                	it:it,
                                	name :  (currentNext.prototype.constructor.name || ("(Anonymous " + this._step + ":" + current + ")") ),
                                	pad: padding(this._originalPad,current)}) - 1;
                            currentNext = it.next();// start
                            this.log("Entering [" + stack[current].name + "]");
                            this._pad = stack[current].pad + "[" + stack[current].name + "]";
                        	
                            continue;
                    }
                    if(isGeneratorIterator(currentNext)){
                        let it = currentNext;
                       	current = stack.push({
                               	it:it,
                               	name : "Gen " + (current || ("(Anonymous " + this._step + ":" + current + ")") ),
                               	pad: padding(this._originalPad,current)}) - 1;
                           currentNext = it.next();// start
                           this.log("Entering sub generator:" + stack[current].name);
                           this._pad = stack[current].pad+ "[" + stack[current].name + "]";
                       	
                           continue;
                   }
                    
                    if(isDirective(currentNext)){
        				this.log("Delegating step:" + this._step + "");
        				this.log(	"Calling directive:" + currentNext.name 
        							+ " pipeline(" + currentNext.pipeline + ") for processing");
        				sended = yield currentNext
        				var sended = isDirective(sended) ? sended.then() : sended;
        				if(!!sended)
        					this.log("Step " + this._step 
        								+ " Received result successfully for ["+ stack[current].name + "]!" 
        								+ " Duration: " + ((new Date()).getTime() - startTime.getTime()) +"ms"
        								+ " \n[Finished]"
        								);
        				
        			}else{
        				this.log("Step " + this._step 
								+ " Transmitted result successfully for ["+ stack[current].name + "]!" 
								+ " Duration: " + ((new Date()).getTime() - startTime.getTime()) +"ms"
								+ " \n[Finished]"
								);
        				sended = currentNext;
        			}
                    
                    this._step++;
		    		currentNext = stack[current].it.send(sended);
		    		
                }catch(e if e instanceof StopIteration){
                    current--;
					let removed = stack.pop();
                    backToPrevious = true;
                    if(current <0){
                    	break;
                    }else{
                    	continue;
                    }
                }
		}
    	
        yield;//must provide empty(null) directive to LoopProvider!
	},
	
	__isDelegate : true,

});
module.exports.Directive = Directive;
module.exports.Delegate = Delegate;
module.exports.isDelegate = function Delegate$isDelegate(o){
	return (typeof(o) === "object" && '__isDelegate' in o);
};
