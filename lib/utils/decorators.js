"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.virtual = exports.once = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var once = exports.once = function once(target, key, descriptor) {
  return (0, _extends3.default)({}, descriptor, {
    value: function value() {
      this.__invokedFunctions = this.__invokedFunctions || [];
      this.__invokedFunctionResults = this.__invokedFunctionResults || [];
      var fn = descriptor.value;
      var index = this.__invokedFunctions.indexOf(fn);
      if (index === -1) {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var result = fn.call.apply(fn, [this].concat(args));
        this.__invokedFunctions.push(fn);
        this.__invokedFunctions.push(result);
        return result;
      }
      return this.__invokedFunctionResults[index];
    }
  });
};

var virtual = exports.virtual = function virtual(target, key, descriptor) {
  return (0, _extends3.default)({}, descriptor, {
    value: function value() {
      throw new Error("Method \"" + key + "\" should be overrided");
    }
  });
};