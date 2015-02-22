let Directive = require('CO').Directive;

module.exports = Directive.create({
		name : "CustomerLogin",
		pipeline : "CommonDirectives-CustomerLogin",
		params : ['login','password'],
});