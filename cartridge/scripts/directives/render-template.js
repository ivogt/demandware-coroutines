let Directive = require('CO').Directive;

module.exports = Directive.create({
		name : "RenderTemplate",
		pipeline : "CommonDirectives-Render",
		params : ['template'],
});