
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



var Class = require('./libInheritance').Class;
var EventedMixin = require('./mixin/evented');
var PromisifyMixin = require('./mixin/promisify');
var ContinuedMixin = require('./mixin/directive-continued');
var assert = require('./core/assert');


var Directive = Class
	.extend(PromisifyMixin)
	.extend(EventedMixin)
	.extend(ContinuedMixin)
	.extend({
	name: "BaseDirective",
	pipeline : undefined,
	params : [],
	scope : undefined,
	//constructor
	init : function Directive$init( scope ){
		let that = this,params = [].slice.call(arguments);
		if(this.params.length && !scope){
			throw new Error("You must create instance of Directive " 
					+ this.name +  " with scope and params: "
					+ " \n Initiate with e.g.: new Directive({" 
					+ this.params.join(': value,') +  ":value})");
			
		}
		this.scope = scope || {};
		this.params.map(function( current ){
			if(!(current in scope)){
				throw new Error("Directive " + that.name + " requires scope for " + current 
								+ "\n Initiate with e.g.: new Directive({" 
								+ that.params.join(': value,') +  ":value})");
			}
		});
		this._super.call(this,params);
	},
	

	
	
});

Object.defineProperty(Directive.prototype, '__isDirective', {
	 value: true, 
	 enumerable: false, 
	 writable : false,
	});
Object.defineProperty(Directive.prototype, 'actions', {
	  get: function() { return this.__eventlisteners__ || {} },
	  set : function(){throw new Error("Cannot modify property actions to instance of Directive@mixed with Evented!");},
	  enumerable: true,
	});

Directive.create = function Directive$create( definitions ){
	let {name , pipeline , params} = definitions || {};
	
	if(!!name && !!pipeline && !!params){
		return Directive.extend(definitions);
	}
	
	throw new Error("Directive is defined by providing {name : string , pipeline : string , params : ['requiredParam']} object")
}
module.exports.Directive = Directive;
module.exports.isDirective = function CO$isDirective(o){
	return (!!o && typeof(o) === "object" && ('__isDirective' in o))
};
