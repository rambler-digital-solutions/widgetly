'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.registerIFrame = registerIFrame;

var _magicTransport = require('magic-transport');

var _url = require('url');

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _DOM = require('../utils/DOM');

var _EventEmitter = require('../utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _DOM.setMutationParams)({
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
});

var IFrameResizer = function () {
  function IFrameResizer(transport) {
    (0, _classCallCheck3.default)(this, IFrameResizer);

    this.events = new _EventEmitter2.default();
    this.transport = transport;
    this.resize = (0, _throttle2.default)(this.resize.bind(this), 60, {
      leading: true,
      trailing: true
    });
  }

  (0, _createClass3.default)(IFrameResizer, [{
    key: 'getSize',
    value: function getSize() {
      return {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      };
    }
  }, {
    key: 'resize',
    value: function resize() {
      var newSize = this.getSize();
      if (!(0, _isEqual2.default)(newSize, this.currentSize)) {
        this.transport.provider.setSize(newSize);
        this.currentSize = newSize;
        this.events.emit('resize', this.currentSize);
      }
    }
  }, {
    key: 'watchSize',
    value: function watchSize() {
      _DOM.mutationEvents.on('mutation', this.resize);
    }
  }]);
  return IFrameResizer;
}();

var IFrameConsumer = function () {

  /**
   * Этот файл должен вызываться из айфрейма
   * @param {Object} config Конфиг
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать приложение
   * @param {Function} [config.externalizeAsConsumer] - Этот метод должен возвращать фасад с методами, которые будут доступны виджету
   * @param {Function} [config.externalize] - Этот метод должен возвращать фасад с методами, которые видны снаружи виджета (вебмастеру)
   * @param {Object} properties Общие свойства
   *
   * Имеет следуюшие свойства
   * @property origin - origin окна, которое загрузило текущий iframe
   */
  function IFrameConsumer(config) {
    var _this = this;

    var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, IFrameConsumer);

    this.id = this.parseId();
    this.config = config;
    this.properties = {};
    this.provider = null;

    (0, _forOwn2.default)(properties, function (value, key) {
      _this.properties[key] = (0, _isFunction2.default)(value) ? value.bind(_this) : value;
      if ((0, _isUndefined2.default)(_this[key])) _this[key] = _this.properties[key];
    });

    this.transport = new _magicTransport.Consumer(this.id, '*', this.externalizeAsConsumer());
    this.resizer = new IFrameResizer(this.transport);
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

  (0, _createClass3.default)(IFrameConsumer, [{
    key: 'parseId',
    value: function parseId() {
      return (0, _url.parse)('?' + window.location.hash.slice(1), true).query.widgetId;
    }
  }, {
    key: 'externalizeAsConsumer',
    value: function externalizeAsConsumer() {
      var _this2 = this;

      return (0, _extends3.default)({}, this.config.externalizeAsConsumer ? this.config.externalizeAsConsumer.call(this) : this.properties, {
        // Эту функцию должен вызывать provider для инициализации
        initialize: function initialize() {
          return _this2.config.initialize.call(_this2, _this2.provider);
        },
        externalizedProps: this.externalize(),
        getSize: function getSize() {
          return _this2.resizer.getSize();
        },
        watchSize: function watchSize() {
          return _this2.resizer.watchSize();
        },
        resize: function resize(params) {
          _this2.resizer.resize(params);
        }
      });
    }

    /**
     * Этот метод возвращает внешние свойства, доступные вебмастеру
     * @return {Object}
     */

  }, {
    key: 'externalize',
    value: function externalize() {
      if (this.config.externalize) return this.config.externalize.call(this);
      return this.properties;
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