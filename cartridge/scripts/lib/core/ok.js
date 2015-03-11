function OKFunction(){
	this.toString = function (){return "[Object OK]"}
}
OKFunction.prototype.toString = function (){
	return "[Object OK]"
}
OKFunction.prototype.isOK = function (obj){
	return !!obj &&  (obj)+"" === "[Object OK]";
}

module.exports = OKFunction;