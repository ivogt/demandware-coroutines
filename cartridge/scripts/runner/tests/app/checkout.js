var BasketApp = require('./basket');
var Render = require('~/cartridge/scripts/directives/render-continue');
var Checkout  = new Render({template : 'tests/checkout/billing'})
Checkout.use(function Checkout$use$Basket(){
	yield BasketApp.handle(function (){
			//handle any verifications
		})
})
module.exports = Checkout;