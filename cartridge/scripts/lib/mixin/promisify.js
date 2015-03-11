

/**
  This mixin allows for CO objects to subscribe and emit events.
  @mixin Promisify
  @namespace CO
 */


  
var assert = require('../core/assert');
var slice = [].slice;


var STATUS_PENDING = 0,
STATUS_RESOLVED = 1,
STATUS_REJECTED = 2,
STATUS_CONTINUED = 3;
  
module.exports = {
	name: "PromiseBase",
	error : undefined,
	_resolvedValue : undefined,
	status : 0,
	then : function Promisify$then(){
		switch(this.status){
		
		case STATUS_RESOLVED :
		case STATUS_CONTINUED :
			return this._resolvedValue;
			break;
		case STATUS_REJECTED :
			return { failed:true , rejected : true , error : this._error , ScriptLog : this.ScriptLog };
			break;
		case STATUS_PENDING :
		default :
			return { failed:true ,rejected:false, error : "Promisified Obj must be resolved/continued or rejected during its pipeline call!"}
			
		}
	},
	resolve : function Promisify$resolve(o){
		if(this.status !== STATUS_PENDING){
			var {name , status} = this;
			throw new Error("Promisified Obj " + name + " cannot be resolved as it is not in PENDING status!");
		}
		this.status = STATUS_RESOLVED;
		this._resolvedValue = o;
	},
	continued : function Promisify$continued( o ){
		this.status = STATUS_CONTINUED;
		this._resolvedValue = o;
	},
	reject	: function (error){
		if(this.status !== STATUS_PENDING){
			var {name , status} = this;
			throw new Error("Promisified Obj " + name + " cannot be rejected as it is not in PENDING status!");
		}
		this.status = STATUS_REJECTED;
		this.error = error;
	},
};