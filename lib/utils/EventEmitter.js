'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = Emitter;

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Emitter() {
  _events2.default.call(this);
  this.setMaxListeners(Infinity);
}

(0, _assign2.default)(Emitter.prototype, _events2.default.prototype, {
  externalizeEmitter: function externalizeEmitter() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var methods = ['on', 'once', 'removeListener'];
    var emitter = this;
    if (params.withEmit) methods.push('emit');
    return methods.reduce(function (result, method) {
      result[method] = function () {
        emitter[method].apply(emitter, arguments);
      };
      return result;
    }, {});
  }
});