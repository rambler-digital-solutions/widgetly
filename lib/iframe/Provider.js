'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _desc, _value, _class2;

var _ContentElement2 = require('../layouts/ContentElement');

var _ContentElement3 = _interopRequireDefault(_ContentElement2);

var _magicTransport = require('magic-transport');

var _iframeResizer = require('iframe-resizer/js/iframeResizer');

var _iframeResizer2 = _interopRequireDefault(_iframeResizer);

var _url = require('url');

var _coreDecorators = require('core-decorators');

var _DOM = require('../utils/DOM');

var _decorators = require('../utils/decorators');

var _viewport = require('../utils/DOM/viewport');

var _EventEmitter = require('../utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var DEFAULT_OFFSET = 100;

var IFrameProvider = (_dec = (0, _coreDecorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function (_ContentElement) {
  _inherits(IFrameProvider, _ContentElement);

  /**
   * Обертка над iframe
   * @param {String} options.url - URL по которому нужно загрузить iframe
   * @param {Widget} options.widget - Объект виджета
   * @param {String} options.id - Уникальный идентификатор виджета
   */
  function IFrameProvider(url, widget, id) {
    _classCallCheck(this, IFrameProvider);

    var _this = _possibleConstructorReturn(this, (IFrameProvider.__proto__ || Object.getPrototypeOf(IFrameProvider)).call(this));

    _EventEmitter2.default.call(_this);
    // Создаем элемент iframe
    _this.id = id;
    _this.url = url + '#widgetId=' + _this.id;
    _this.widget = widget;

    _this._destroyed = false;

    var _parseUrl = (0, _url.parse)(url),
        protocol = _parseUrl.protocol,
        host = _parseUrl.host;

    if (host) _this.consumerOrigin = protocol + '//' + host;else _this.consumerOrigin = location.origin;
    _this.createElement();
    return _this;
  }

  _createClass(IFrameProvider, [{
    key: 'createElement',
    value: function createElement() {
      this.element = document.createElement('iframe');
      this.element.style.display = 'block !important';
      this.element.setAttribute('frameborder', 'no');
      this.element.setAttribute('width', '100%');
      this.element.src = this.url;
      this.element.name = this.id;
      (0, _DOM.onRemoveFromDOM)(this.element, this.destroy);
    }
  }, {
    key: 'initialize',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var resizedResolve, initResolve, resizedPromise, initPromise;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.transport = new _magicTransport.Provider(this.id, this.consumerOrigin, this.widget.externalizeAsProvider());
                this.provider = this.transport.provider;
                _context.next = 4;
                return new Promise(function (resolve) {
                  return _this2.transport.once('ready', resolve);
                });

              case 4:
                this.consumer = _context.sent;
                resizedResolve = void 0;
                initResolve = void 0;
                resizedPromise = new Promise(function (resolve) {
                  resizedResolve = resolve;
                });
                initPromise = new Promise(function (resolve) {
                  initResolve = resolve;
                });

                this.resizer = (0, _iframeResizer2.default)({
                  targetOrigin: this.consumerOrigin,
                  resizedCallback: function resizedCallback() {
                    resizedResolve();
                    // Иногда initCallback может не вызваться почему то
                    initResolve();
                  },
                  initCallback: initResolve
                }, this.element)[0].iFrameResizer;

                _context.next = 12;
                return Promise.all([resizedPromise, initPromise, this.consumer.initialize()]);

              case 12:
                return _context.abrupt('return', this.consumer);

              case 13:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function initialize() {
        return _ref.apply(this, arguments);
      }

      return initialize;
    }()

    /**
    * Функция вызовется при изменении viewport контента (айфрейма)
    * @param {Number} [offset]
    */

  }, {
    key: 'subscribeVisibleAreaChange',
    value: function subscribeVisibleAreaChange(offset, callback) {
      var _this3 = this;

      if (typeof offset === 'function') {
        callback = offset;
        offset = DEFAULT_OFFSET;
      }
      this.subscribeViewportChange();
      this.on('viewportChange', function () {
        callback(_this3.getVisibleArea());
      });
    }
  }, {
    key: 'getVisibleArea',
    value: function getVisibleArea() {
      return (0, _viewport.getVisibleArea)(this.element);
    }
  }, {
    key: 'subscribeViewportChange',
    value: function subscribeViewportChange() {
      this.widget.on('viewportUpdated', this.onViewportChange);
      _DOM.viewportEvents.on('change', this.onViewportChange);
    }

    /**
     * Обработчик скролла
     */

  }, {
    key: 'onViewportChange',
    value: function onViewportChange() {
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
      _DOM.viewportEvents.removeListener('change', this.onViewportChange);
    }
  }]);

  return IFrameProvider;
}(_ContentElement3.default), (_applyDecoratedDescriptor(_class2.prototype, 'subscribeViewportChange', [_decorators.once], Object.getOwnPropertyDescriptor(_class2.prototype, 'subscribeViewportChange'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'onViewportChange', [_coreDecorators.autobind], Object.getOwnPropertyDescriptor(_class2.prototype, 'onViewportChange'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'destroy', [_coreDecorators.autobind, _decorators.once], Object.getOwnPropertyDescriptor(_class2.prototype, 'destroy'), _class2.prototype)), _class2)) || _class);
exports.default = IFrameProvider;