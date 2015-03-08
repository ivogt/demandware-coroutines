
function RetryFunction(){}
RetryFunction.prototype.toString = function (){
	return "[Object Retry]"
}
RetryFunction.prototype.isRetry = function (obj){
	return !!obj &&  (obj)+"" === "[Object Retry]";
}

module.exports = RetryFunction;