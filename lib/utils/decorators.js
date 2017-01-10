"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var once = exports.once = function once(target, key, descriptor) {
  return _extends({}, descriptor, {
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
  return _extends({}, descriptor, {
    value: function value() {
      throw new Error("Method \"" + key + "\" should be overrided");
    }
  });
};