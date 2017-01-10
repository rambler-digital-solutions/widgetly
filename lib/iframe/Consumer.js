'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.registerIFrame = registerIFrame;

var _magicTransport = require('magic-transport');

var _url = require('url');

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IFrameResizer = function IFrameResizer(options) {
  _classCallCheck(this, IFrameResizer);

  window.iFrameResizer = options;
  /* eslint-disable global-require */
  require('iframe-resizer/js/iframeResizer.contentWindow');
  /* eslint-enable global-require */
  this.parent = window.parentIFrame;
};

var IFrameConsumer = function () {

  /**
   * Этот файл должен вызываться из айфрейма
   * @param {Object} config Конфиг
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать приложение
   * @param {Function} [config.externalizeAsConsumer] - Этот метод должен возвращать фасад с методами, которые будут доступны виджету
   * @param {Object} properties Общие свойства
   *
   * Имеет следуюшие свойства
   * @property origin - origin окна, которое загрузило текущий iframe
   */
  function IFrameConsumer(config) {
    var _this = this;

    var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, IFrameConsumer);

    this.id = this.parseId();
    this.config = config;
    this.properties = {};
    this.provider = null;

    (0, _forOwn2.default)(properties, function (value, key) {
      if ((0, _isUndefined2.default)(_this[key])) _this[key] = value;
      _this.properties[key] = (0, _isFunction2.default)(value) ? value.bind(_this) : value;
    });

    this.transport = new _magicTransport.Consumer(this.id, '*', this.externalizeAsConsumer());
    this.consumer = this.transport.consumer;
    this.transport.once('ready', function () {
      _this.provider = _this.transport.provider;
      _this.parentUrl = _this.provider.url;

      var _parseUrl = (0, _url.parse)(_this.parentUrl),
          protocol = _parseUrl.protocol,
          host = _parseUrl.host;

      _this.parentOrigin = protocol + '//' + host;
    });
  }

  _createClass(IFrameConsumer, [{
    key: 'parseId',
    value: function parseId() {
      return (0, _url.parse)('?' + window.location.hash.slice(1), true).query.widgetId;
    }
  }, {
    key: 'externalizeAsConsumer',
    value: function externalizeAsConsumer() {
      var _this2 = this;

      return _extends({}, this.config.externalizeAsConsumer ? this.config.externalizeAsConsumer.call(this) : this.properties, {
        // Эту функцию должен вызывать provider для инициализации
        initialize: function initialize() {
          return Promise.resolve(_this2.config.initialize.call(_this2, _this2.provider)).then(function () {
            return new Promise(function (resolve) {
              _this2.resizer = new IFrameResizer({
                targetOrigin: '*',
                readyCallback: function readyCallback() {
                  return resolve();
                }
              });
            });
          });
        }
      });
    }
  }]);

  return IFrameConsumer;
}();

/**
 * Регистрация айфрейма
 */


exports.default = IFrameConsumer;
function registerIFrame() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(IFrameConsumer, [null].concat(args)))();
}