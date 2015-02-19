let Directive = require('Delegates').Directive;

module.exports = Directive.create({
		name : "CustomerLogin",
		pipeline : "CommonDirectives-CustomerLogin",
		params : ['login','password'],
});