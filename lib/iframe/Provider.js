'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _class, _desc, _value, _class2;

var _ContentElement2 = require('../layouts/ContentElement');

var _ContentElement3 = _interopRequireDefault(_ContentElement2);

var _magicTransport = require('magic-transport');

var _url = require('url');

var _DOM = require('../utils/DOM');

var _decorators = require('../utils/decorators');

var _viewport = require('../utils/DOM/viewport');

var _EventEmitter = require('../utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Resizer = function () {
  function Resizer(container, transport) {
    (0, _classCallCheck3.default)(this, Resizer);

    this.container = container;
    this.transport = transport;
  }

  (0, _createClass3.default)(Resizer, [{
    key: 'resize',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var size;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.transport.consumer.getSize();

              case 2:
                size = _context.sent;

                this.setSize(size);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function resize() {
        return _ref.apply(this, arguments);
      }

      return resize;
    }()
  }, {
    key: 'setSize',
    value: function setSize(_ref2) {
      var height = _ref2.height;

      this.container.style.height = height + 'px';
    }
  }]);
  return Resizer;
}();

var IFrameProvider = (_dec = (0, _decorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function (_ContentElement) {
  (0, _inherits3.default)(IFrameProvider, _ContentElement);

  /**
   * Обертка над iframe
   * @param {String} options.url - URL по которому нужно загрузить iframe
   * @param {Widget} options.widget - Объект виджета
   * @param {String} options.id - Уникальный идентификатор виджета
   *
   * @events
   * viewportChange - событие которое вызывается, когда вьюпорт элемента изменени
   */
  function IFrameProvider(url, widget, id) {
    (0, _classCallCheck3.default)(this, IFrameProvider);

    var _this = (0, _possibleConstructorReturn3.default)(this, (IFrameProvider.__proto__ || (0, _getPrototypeOf2.default)(IFrameProvider)).call(this));

    _EventEmitter2.default.call(_this);
    // Создаем элемент iframe
    _this.id = id;
    _this.url = url + (url.indexOf('#') === -1 ? '#' : '&') + 'widgetId=' + _this.id;
    _this.widget = widget;

    _this._destroyed = false;

    var _parseUrl = (0, _url.parse)(url),
        protocol = _parseUrl.protocol,
        host = _parseUrl.host;

    if (host) _this.consumerOrigin = protocol + '//' + host;else _this.consumerOrigin = location.origin;
    _this.createElement();
    return _this;
  }

  (0, _createClass3.default)(IFrameProvider, [{
    key: 'createElement',
    value: function createElement() {
      this.element = document.createElement('iframe');
      this.element.style.display = 'block !important';
      this.element.setAttribute('frameborder', 'no');
      this.element.setAttribute('width', '100%');
      this.element.setAttribute('scrolling', 'no');
      this.element.name = this.id;
      this.element.id = this.id;
      this.element.src = this.url;
      (0, _DOM.onRemoveFromDOM)(this.element, this.destroy);
    }
  }, {
    key: 'initialize',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.transport = new _magicTransport.Provider(this.id, this.consumerOrigin, (0, _extends3.default)({}, this.widget.externalizeAsProvider(), {
                  resize: function resize() {
                    return _this2.resizer.resize();
                  },
                  setSize: function setSize(size) {
                    return _this2.resizer.setSize(size);
                  }
                }));
                this.resizer = new Resizer(this.element, this.transport);
                this.provider = this.transport.provider;
                _context2.next = 5;
                return new _promise2.default(function (resolve) {
                  return _this2.transport.once('ready', resolve);
                });

              case 5:
                this.consumer = _context2.sent;
                _context2.next = 8;
                return this.consumer.initialize();

              case 8:
                _context2.next = 10;
                return this.resizer.resize();

              case 10:
                this.consumer.watchSize();

                return _context2.abrupt('return', this.consumer);

              case 12:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function initialize() {
        return _ref3.apply(this, arguments);
      }

      return initialize;
    }()

    /**
     * Подписка на изменение видимой области iframe
     * @param {Function}  callback
     * @return {Function} Функция отписки от события
     */

  }, {
    key: 'subscribeVisibleAreaChange',
    value: function subscribeVisibleAreaChange(callback) {
      var _this3 = this;

      this._subscribeViewportChange();
      var withCallback = function withCallback() {
        callback(_this3.getVisibleArea());
      };
      this.on('viewportChange', withCallback);
      var unsubscribeVisibleAreaChange = function unsubscribeVisibleAreaChange() {
        _this3.removeListener('viewportChange', withCallback);
      };
      return unsubscribeVisibleAreaChange;
    }
  }, {
    key: 'getVisibleArea',
    value: function getVisibleArea() {
      return (0, _viewport.getVisibleArea)(this.element);
    }
  }, {
    key: '_subscribeViewportChange',
    value: function _subscribeViewportChange() {
      if (!this.viewportManager) this.viewportManager = (0, _DOM.createViewportManager)(this.element, this.updateViewport);
    }

    /**
     * Обработчик скролла
     */

  }, {
    key: 'updateViewport',
    value: function updateViewport() {
      this.emit('viewportChange');
    }

    /**
     * Пересчитать размеры айфрейма
     */

  }, {
    key: 'resize',
    value: function resize() {
      this.resizer.resize();
    }

    /**
     * Метод вызывается при удалении айфрейма
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      (0, _DOM.removeFromDOM)(this.element);
      this.emit('destroy');
      this.transport.destroy();
      this.removeAllListeners();
      if (this.viewportManager) this.viewportManager.destroy();
    }
  }]);
  return IFrameProvider;
}(_ContentElement3.default), (_applyDecoratedDescriptor(_class2.prototype, '_subscribeViewportChange', [_decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, '_subscribeViewportChange'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'updateViewport', [_decorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'updateViewport'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'destroy', [_decorators.autobind, _decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'destroy'), _class2.prototype)), _class2)) || _class);
exports.default = IFrameProvider;