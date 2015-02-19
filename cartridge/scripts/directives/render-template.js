let Directive = require('Delegates').Directive;

module.exports = Directive.create({
		name : "RenderTemplate",
		pipeline : "CommonDirectives-Render",
		params : ['template'],
});