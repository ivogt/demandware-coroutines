var config = require("~/package.json");
	//, util = require("util");// TODO: Implement util.inspect!
var res : dw.system.Response  = response; // global in DMW
var StringUtils =require('dw/util/StringUtils');
var encode = function(data) {
	return StringUtils.encodeBase64(JSON.stringify(data));
};
var Trace = function Trace(){
	try{
		throw new Error();
	}catch(e)
	{
		return e;
	}
}
  var data = {
    version: config.version
    , columns: ["log", "backtrace", "type"]
    , rows: []
  };

  var log = function (type, l) {
    l = l ? l : 2;
    return function () {
     // try {
        data.rows.push([
          Array.prototype.slice.call(arguments).map(function (a) {
            if (!a || typeof a !== "object") return a + "";
            a.___class_name = a.constructor.name;
            return a;
          })
          , Trace().stack.split("\n")[l].trim()
          , type
        ]);
        res.addHttpHeader("X-ChromeLogger-Data", encode(data));
//      } catch (e) {
//        data.rows.pop();
//        log("error", 3)(e.toString());
//      }
    };
  };

module.exports = {
    log: log("")
    , info: log("")
    , debug: log("")
    , table: log("table")
    , warn: log("warn")
    , error: log("error")
    , group: log("group")
    , groupEnd: log("groupEnd")
    , groupCollapsed: log("groupCollapsed")
    //, dir: function (obj) { log("", 3)(util.inspect(obj)); } // TODO: FIX this!
    , groupAs: function (name, f) { log("groupCollapsed", 3)(name); f(); log("groupEnd", 3)(); }
    , assert: function (test, msg) { if (!test) log("error", 3)("Assertion failed: " + msg); }
    , groupAssert: function (test, msg, f) {
      if (!test) {
        log("groupCollapsed", 3)("Assertion failed: " + msg); f(); log("groupEnd", 3)();
      }
    }
 };

