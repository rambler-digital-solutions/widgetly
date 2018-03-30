'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _class, _desc, _value, _class2;

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _Provider = require('./iframe/Provider');

var _Provider2 = _interopRequireDefault(_Provider);

var _EventEmitter = require('./utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _DOM = require('./utils/DOM');

var _decorators = require('./utils/decorators');

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

/**
 * Класс виджета
 *
 * @property {EventEmitter} events - события
 * @event 'destroy' - событие кидается при удалении виджета
 */
var Widget = (_dec = (0, _decorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function () {

  /**
   * Конструктор
   * @param {Mediator} mediator - Медиатор
   * @param {String} id - Идентификатор виджета
   * @param {Object} config - Конфиг виджета
   * @param {String} config.name - Уникальное название виджета
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать виджет
   * @param {Function} [config.destroy] - Функция удаления виджета, эту функцию должен вызвать пользователь при удалнии виджета
   * @param {Function} [config.externalize] - Этот метод должен возвращать фасад с методами, которые будут доступны пользователю
   * @param {Function} [config.externalizeAsProvider] - Этот метод должен возвращать фасад с методами, которые будут доступны айфрейму
   * @param {Object} properties - Свойства виджета, этот объект копируется как есть в виджет(this) и дополняет его этими свойствами
   * @param {Object} params - Некоторые внешние параметры для виджета
   * Можно указать объект с любыми свойствами, за исключением зарезервированных (и свойств начинающихся на _):
   * - mediator
   * - id
   * - config
   * - name
   * - properties
   * - params
   * - initialize
   * - updateViewport
   * - destroy
   * - createIFrame
   * - externalize
   * - externalizeAsProvider
   * - whenContainerInViewport
   */


  /**
   * Идентификатор виджета
   * @type {Number}
   */
  function Widget(mediator, id, config, properties, params) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Widget);
    this.params = {};
    this.id = null;
    this.mediator = null;

    _EventEmitter2.default.call(this);
    this.mediator = mediator;
    this.id = id;
    this.config = config;
    this.name = config.name;
    this.properties = {};
    this.params = params;
    this._destroyed = false;

    if (config.externalize) this.externalize = config.externalize.bind(this);

    (0, _forOwn2.default)(properties, function (value, key) {
      _this.properties[key] = (0, _isFunction2.default)(value) ? value.bind(_this) : value;
      if ((0, _isUndefined2.default)(_this[key])) _this[key] = _this.properties[key];
    });
  }

  /**
   * Медиатор
   * @type {Mediator}
   */


  /**
   * Параметры виджета
   * @type {Object}
   */


  (0, _createClass3.default)(Widget, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      var initialize = this.config.initialize;

      return _promise2.default.resolve(initialize.call(this)).then(function () {
        _this2._subscribeEvents();
        return _this2.externalize();
      });
    }
  }, {
    key: 'updateViewport',
    value: function updateViewport() {
      if (this.container) this.container.updateViewport();
      if (this.iframe) this.iframe.updateViewport();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._unsubscribeEvents();
      if (this.layout) this.layout.destroy();
      if (this.iframe) this.iframe.destroy();
      if (this.config.destroy) this.config.destroy.call(this);
      this.emit('destroy');
      this.removeAllListeners();
    }

    /**
     * Создаем айфрейм
     * @param {String} url - Адрес, где расположен iframe
     */

  }, {
    key: 'createIFrame',
    value: function createIFrame(url) {
      return new _Provider2.default(url, this, this.id);
    }

    /**
     * Экспортирование свойств, которые будут доступны внешнему пользователю
     */

  }, {
    key: 'externalize',
    value: function externalize() {
      return (0, _extends3.default)({}, this.properties, this.iframe ? this.iframe.consumer.externalizedProps : {}, this.externalizeEmitter(), {
        destroy: this.destroy.bind(this),
        params: this.params
      });
    }

    /**
     * Экспортирование свойств, которые будут доступны в iframe
     */

  }, {
    key: 'externalizeAsProvider',
    value: function externalizeAsProvider() {
      var _context;

      var externalizeAsProvider = this.config.externalizeAsProvider;

      return (0, _extends3.default)({
        url: location.href,
        mediator: this.mediator.externalizeAsProvider(),
        destroy: this.destroy.bind(this),
        params: this.params,
        subscribeVisibleAreaChange: this._subscribeVisibleAreaChange.bind(this),
        getVisibleArea: this._getIFrameVisibleArea.bind(this),
        scrollTo: this._iFrameScrollTo.bind(this),
        resize: (_context = this.iframe).resize.bind(_context)
      }, this.externalizeEmitter({ withEmit: true }), externalizeAsProvider ? externalizeAsProvider.call(this) : this.properties);
    }
  }, {
    key: 'whenContainerInViewport',
    value: function whenContainerInViewport() {
      var _container;

      return !this.container ? _promise2.default.resolve() : (_container = this.container).whenEnterViewportFromTop.apply(_container, arguments);
    }

    /**
     * Подскроллить к определенной части айфрейма
     * @param {Number} top - координата относительно верхнего левого угла айфрейма, к которой нужно подскроллить
     * @param {Number} duration = 200 - время анимации скролла
     */

  }, {
    key: '_iFrameScrollTo',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(top, duration) {
        return _regenerator2.default.wrap(function _callee$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _DOM.scrollByElementTo)(this.iframe.getElement(), top, duration);

              case 2:
                this.iframe.updateViewport();

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee, this);
      }));

      function _iFrameScrollTo(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return _iFrameScrollTo;
    }()

    /**
     * Колбек изменения вьюпорта айфрема (айфрем виден или нет)
     * @return {[type]} [description]
     */

  }, {
    key: '_subscribeVisibleAreaChange',
    value: function _subscribeVisibleAreaChange(offset, callback) {
      if (this.iframe) return this.iframe.subscribeVisibleAreaChange(offset, callback);
    }
  }, {
    key: '_subscribeEvents',
    value: function _subscribeEvents() {
      if (this.iframe) this.iframe.on('destroy', this.destroy);
      if (this.layout) this.iframe.on('destroy', this.destroy);
      if (this.container) this.container.on('destroy', this.destroy);
    }
  }, {
    key: '_unsubscribeEvents',
    value: function _unsubscribeEvents() {
      if (this.iframe) this.iframe.removeListener('destroy', this.destroy);
      if (this.layout) this.layout.removeListener('destroy', this.destroy);
      if (this.container) this.container.removeListener('destroy', this.destroy);
    }
  }, {
    key: '_getIFrameVisibleArea',
    value: function _getIFrameVisibleArea() {
      return this.iframe.getVisibleArea();
    }
  }]);
  return Widget;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'destroy', [_decorators.autobind, _decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'destroy'), _class2.prototype)), _class2)) || _class);
exports.default = Widget;