

/**
 * Example
 * 	Whithin CO
 * 	Delagete(function (){
 * 		yield Application.run();
 * }).run("Running Application!");
 * 
 * 
 * 
 * 
 */

var Class = require('./libInheritance').Class;
var Application = Class.extend({
	uses : [],
	run : function Application$run (){
		while(true){
			yield this.__route();
		}
	},
	__route : function () {
		
	},
});



Application.create =function Application$create(){}
Application.use =function Application$use(  ){
	
}


module.exports = Application;