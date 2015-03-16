var Render = require('~/cartridge/scripts/directives/render-continue');

Basket = new Render({template : "tests/checkout/cart/cart"});
var DirectiveGetBasket = require('~/cartridge/scripts/directives/get-basket');

Basket
.use(function (){
	var basket = yield new DirectiveGetBasket();
	this.basket = basket;
})
.on('checkout',function(){
	yield this.ok();
})
module.exports = Basket;