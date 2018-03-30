'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _class, _desc, _value, _class2;

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Mediator, [null].concat(args)))();
};

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _domready = require('domready');

var _domready2 = _interopRequireDefault(_domready);

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _randomId = require('./utils/randomId');

var _randomId2 = _interopRequireDefault(_randomId);

var _decorators = require('./utils/decorators');

var _DOM = require('./utils/DOM');

var _EventEmitter = require('./utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _Container = require('./Container');

var _Container2 = _interopRequireDefault(_Container);

var _Widget = require('./Widget');

var _Widget2 = _interopRequireDefault(_Widget);

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
 * @class Mediator - класс медиатора
 */
var Mediator = (_dec = (0, _decorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function () {
  (0, _createClass3.default)(Mediator, null, [{
    key: 'provideId',
    value: function provideId() {
      return (0, _randomId2.default)();
    }

    /**
     * Генерация widgetId
     * @type {Number}
     */


    /**
     * Виджеты
     * @type {Object}
     */


    /**
     * Инстанции виджетов
     * @type {Object}
     */

  }]);

  /**
   * Медиатор
   * @param {Object} options - Конфиг виджета
   * @param {String} options.prefix - Префикс для data-атрибутов
   * @param {Function} options.initialize - Функция инициализации
   * @param {Object} [properties] - Дополнительные свойства/методы для медиатора
   * Можно указать объект с любыми свойствами, за исключением зарезервированных (и свойств начинающихся на _):
   * - options
   * - prefix
   * - id
   * - properties
   * - initializeDOMElements
   * - counterWidgetId
   * - widgets
   * - widgetInstances
   * - destroy
   * - provideWidgetId
   * - defineWidget
   * - buildWidget
   * - updateViewport
   * - initializeDOMElements
   * - externalize
   * - externalizeAsProvider
   */
  function Mediator() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Mediator);
    this.counterWidgetId = 0;
    this.widgets = {};
    this.widgetInstances = {};

    _EventEmitter2.default.call(this);
    this.options = options;
    this.prefix = options.prefix;
    this.config = options.config || {};
    this.id = Mediator.provideId();
    this.properties = {};
    (0, _forOwn2.default)(properties, function (value, key) {
      if ((0, _isUndefined2.default)(_this[key])) _this[key] = value;
      _this.properties[key] = (0, _isFunction2.default)(value) ? value.bind(_this) : value;
    });
    if (this.options.initialize) this.options.initialize.call(this);
    _DOM.mutationEvents.on('mutation', this.initializeDOMElements);
    (0, _domready2.default)(this.initializeDOMElements);
  }

  (0, _createClass3.default)(Mediator, [{
    key: 'destroy',
    value: function destroy() {
      _DOM.mutationEvents.removeListener('mutation', this.initializeDOMElements);
    }

    /**
     * Получить айдишник для виджета
     */

  }, {
    key: 'provideWidgetId',
    value: function provideWidgetId() {
      var prefix = this.prefix ? this.prefix + '_' : '';
      return '' + prefix + this.id + '_' + ++this.counterWidgetId;
    }

    /**
     * Определяем виджет
     * @param {Object} config - Конфиг виджета
     * @param {String} config.name - Уникальное название виджета
     * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать виджет
     * @param {Function} config.destroy - Функция удаления виджета, эту функцию должен вызвать пользователь при удалнии виджета
     * @param {Function} config.externalize - Этот метод должен возвращать фасад с методами, которые будут доступны пользователю
     * @param {Function} [config.externalizeAsProvider] - Этот метод должен возвращать фасад с методами, которые будут доступны айфрейму
     * @param {Object} properties - Свойства виджета, этот объект копируется как есть в виджет(this) и дополняет его этими свойствами
     */

  }, {
    key: 'defineWidget',
    value: function defineWidget() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.widgets[config.name]) throw new Error('Widget with name \'' + config.name + '\' already exists');
      this.widgets[config.name] = {
        config: config,
        properties: properties
      };
    }

    /**
     * Создание виджета и установка его на страницу
     * @param {String} name - Название виджета
     * @param {HTMLElement|String} - Элемент/селектор, в которой будет вставлен виджет
     * @param {Object} params - Параметры инициализации виджета
     * @return {Promise}
     */

  }, {
    key: 'buildWidget',
    value: function buildWidget(name, containerElement, params) {
      var _this2 = this;

      (0, _assert2.default)(this.widgets[name], 'Widget \'' + name + '\' does not exists');
      if (!params && typeof containerElement !== 'string' && !(containerElement instanceof HTMLElement)) {
        params = containerElement;
        containerElement = null;
      }
      if (typeof containerElement === 'string') containerElement = document.querySelector(containerElement);
      var _widgets$name = this.widgets[name],
          config = _widgets$name.config,
          properties = _widgets$name.properties;

      var id = this.provideWidgetId();
      var widget = this.widgetInstances[id] = new _Widget2.default(this, id, config, properties, params);
      widget.once('destroy', function () {
        return delete _this2.widgetInstances[id];
      });
      widget.container = containerElement ? new _Container2.default(containerElement) : null;
      if (containerElement) containerElement.rcWidget = widget;
      return widget.initialize();
    }
  }, {
    key: 'updateViewport',
    value: function updateViewport() {
      (0, _forOwn2.default)(this.widgetInstances, function (widget) {
        return widget.updateViewport();
      });
    }

    /**
     * Инициализация DOM-элементов
     */

  }, {
    key: 'initializeDOMElements',
    value: function initializeDOMElements() {
      var _this3 = this;

      var prefix = this.prefix ? this.prefix + '-' : '';
      var elements = [].slice.call(document.querySelectorAll('[data-' + prefix + 'widget]:not([data-' + prefix + 'inited])'));
      elements.forEach(function (element) {
        var dataset = (0, _objectWithoutProperties3.default)(element.dataset, []);

        if (_this3.prefix) {
          var prefixLen = _this3.prefix.length;
          // убираем префикс
          (0, _forOwn2.default)(dataset, function (value, key) {
            var newKey = key.slice(prefixLen, prefixLen + 1).toLowerCase() + key.slice(prefixLen + 1);
            dataset[newKey] = value;
            delete dataset[key];
          });
        }
        var widget = dataset.widget,
            params = (0, _objectWithoutProperties3.default)(dataset, ['widget']);

        _this3.buildWidget(widget, element, params);
        element.setAttribute('data-' + prefix + 'inited', true);
      });
    }
  }, {
    key: 'externalize',
    value: function externalize() {
      return (0, _extends3.default)({
        buildWidget: this.buildWidget.bind(this),
        initializeDOMElements: this.initializeDOMElements.bind(this)
      }, this.properties, this.externalizeEmitter());
    }
  }, {
    key: 'externalizeAsProvider',
    value: function externalizeAsProvider() {
      var externalizeAsProvider = this.options.externalizeAsProvider;

      return (0, _extends3.default)({
        buildWidget: this.buildWidget.bind(this),
        initializeDOMElements: this.initializeDOMElements.bind(this)
      }, this.externalizeEmitter(), externalizeAsProvider ? externalizeAsProvider.call(this) : this.properties);
    }
  }]);
  return Mediator;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'updateViewport', [_decorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'updateViewport'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'initializeDOMElements', [_decorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'initializeDOMElements'), _class2.prototype)), _class2)) || _class);