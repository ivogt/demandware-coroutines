var RenderContinue = require('~/cartridge/scripts/directives/render-continue');
var LoginMixin = require('../app_mixins/customer/login');
var GetCustomer = require('~/cartridge/scripts/directives/customer-get');
module.exports = function auth(){
	trace("Call Auth Handler");
	var customer = yield new GetCustomer();
	if(!customer.authenticated){
		let ok = this.ok();
		var Login = new RenderContinue({template:"tests/RunnerTest/login-test" , customer: customer });
		yield Login.mixin(LoginMixin).handle(function (){
			yield this.ok();
		});
	}else{
		trace("you are authenticated!")
	}
}