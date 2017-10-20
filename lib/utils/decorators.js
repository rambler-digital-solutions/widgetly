"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = exports.virtual = exports.autobind = exports.once = undefined;

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

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

var autobind = exports.autobind = function autobind(target, key, _ref) {
  var fn = _ref.value,
      configurable = _ref.configurable,
      enumerable = _ref.enumerable;
  return {
    configurable: configurable,
    enumerable: enumerable,
    get: function get() {
      var boundFn = fn.bind(this);
      (0, _defineProperty2.default)(this, key, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: boundFn
      });
      return boundFn;
    }
  };
};

var virtual = exports.virtual = function virtual(target, key, descriptor) {
  return (0, _extends3.default)({}, descriptor, {
    value: function value() {
      throw new Error("Method \"" + key + "\" should be overrided");
    }
  });
};

var mixin = exports.mixin = function mixin(prototype) {
  return function (target) {
    (0, _assign2.default)(target.prototype, prototype);
    return target;
  };
};