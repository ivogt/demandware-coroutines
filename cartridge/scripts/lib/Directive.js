var Class = require('./libInheritance').Class;
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
function castParamsToObject (request){
	let casted = {},params=httpParameters;
	for(param in params){
		let [value] = params[param];//destructure to [0]
		casted[param] = value;
	}
	return casted;
}
function RetryFunction(){}
function OKFunction(){}
var Directive = Class.extend({
	name: "BaseDirective",
	error : undefined, // hold any error during execution - check error with var {error} = DirectiveInstance;
	pipeline : undefined,
	ScriptLog : "",
	status : 0,
	castParamsToObject:castParamsToObject,
	STATUS_PENDING : 0,
	STATUS_RESOLVED : 1,
	STATUS_REJECTED : 2,
	STATUS_CONTINUED : 3,
	
	params : [],
	_resolvedValue : undefined,
	_on : {"submit" : [] },
	scope : undefined,
	//constructor
	init : function Directive$init( scope ){
		let that = this;
		if(this.params.length && !scope){
			throw new Error("You must create instance of Directive " 
					+ this.name +  " with scope and params: "
					+ " \n Initiate with e.g.: new Directive({" 
					+ this.params.join(': value,') +  ":value})");
			
		}
		this.scope = scope || {};
		this.scope.retry = function Directive$retry(){ return new RetryFunction();};
		this.scope.ok = function Directive$ok(){ return new OKFunction();};
		this.params.map(function( current ){
			//if(isArray(current)) return;
			if(!(current in scope)){
				throw new Error("Directive " + that.name + " requires scope for " + current 
								+ "\n Initiate with e.g.: new Directive({" 
								+ that.params.join(': value,') +  ":value})");
			}
		});
	},
	then : function Directive$then(){
		switch(this.status){
		
		case this.STATUS_RESOLVED :
		case this.STATUS_CONTINUED :
			return this._resolvedValue;
			break;
		case this.STATUS_REJECTED :
			return { failed:true , rejected : true , error : this._error , ScriptLog : this.ScriptLog };
			break;
		case this.STATUS_PENDING :
		default :
			return { failed:true ,rejected:false, error : "Directive must be resolved/continued or rejected during its pipeline call!"}
			
		}
	},
	resolve : function Directive$resolve(o){
		if(this.status !== this.STATUS_PENDING){
			var {name , status} = this;
			throw new Error("Directive " + name + " cannot be resolved as it is not in PENDING status!");
		}
		this.status = this.STATUS_RESOLVED;
		this._resolvedValue = o;
	},
	continued : function Directive$continued( o ){
		this.status = this.STATUS_CONTINUED;
		this._resolvedValue = o;
	},
	reject	: function (error){
		if(this.status !== this.STATUS_PENDING){
			var {name , status} = this;
			throw new Error("Directive " + name + " cannot be rejected as it is not in PENDING status!");
		}
		this.status = this.STATUS_REJECTED;
		this.error = error;
	},

	handle : function Directive$continue(cb){
		let cbMap = [].slice.call(this._on["submit"]);//guarantees cb is not in the original events queue
		if(typeof(cb) === "function") {
			cbMap.push(cb);
		}else if(!!cb){
			throw new Error("Directive$continue(cb) supports only functions as callback to handle Events.\n Events will always be binded to the Directive's scope!");
		}
		let result;
		for(;;){ 
			result = yield this; // call event loop with Directive forever :)
			
			for(let cbIndex in cbMap){
				let cbCurrent = cbMap[cbIndex];
				let next =yield cbCurrent.call(this.scope, result);
				if(typeof(next) === "object" && next instanceof RetryFunction){
					break;
					continue;
				}
				if(typeof(next) === "object" && next instanceof OKFunction){
					throw StopIteration; // halt drain for this directive; 
				}
				
			}
			
		}
		throw new Error("Directive.constinue must be resolved and possibly");
	},
	on : function Directive$on(eventName , cb){
		if(typeof(cb) !== "function") throw new Error("Directive.on supports only functions to handle Events.\n Events will always be binded to the Directive's scope!");
		this._on[eventName].push(cb);
	},
	__isDirective : true,
});
Directive.create = function Directive$create( definitions ){
	let {name , pipeline , params} = definitions || {};
	
	if(!!name && !!pipeline && !!params){
		return Directive.extend(definitions);
	}
	
	throw new Error("Directive is defined by providing {name : string , pipeline : string , params : ['requiredParam']} object")
}
module.exports.Directive = Directive;
module.exports.isDirective = function CO$isCO(o){
	return (!!o && typeof(o) === "object" && ('__isDirective' in o))
};
