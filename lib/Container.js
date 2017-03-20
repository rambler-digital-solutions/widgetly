'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _class, _desc, _value, _class2;

var _EventEmitter = require('./utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _DOM = require('./utils/DOM');

var _viewport = require('./utils/DOM/viewport');

var _decorators = require('./utils/decorators');

var _coreDecorators = require('core-decorators');

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

var Container = (_dec = (0, _coreDecorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function () {

  /**
   * Конструктор контейнера
   * @param {HTMLElement} element - DOM-элемент контейнера
   */
  function Container(element) {
    (0, _classCallCheck3.default)(this, Container);

    _EventEmitter2.default.call(this);
    this.element = element;
    this._ready = false;
    this.emit('ready');
    (0, _DOM.onRemoveFromDOM)(this.element, this.destroy);
  }

  /**
   * Уничтожить контейнер вручную
   */


  (0, _createClass3.default)(Container, [{
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }

    /**
     * Добавить элемент с контентом
     */

  }, {
    key: 'appendChild',
    value: function appendChild(element) {
      this.element.appendChild(element);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.emit('destroy');
      this.removeAllListeners();
      if (this.viewportManager) this.viewportManager.destroy();
    }
  }, {
    key: 'updateViewport',
    value: function updateViewport() {
      this.emit('viewportChange');
    }
  }, {
    key: '_subscribeScroll',
    value: function _subscribeScroll() {
      if (!this.viewportManager) this.viewportManager = (0, _DOM.createViewportManager)(this.element, this._onScroll);
    }
  }, {
    key: '_onScroll',
    value: function _onScroll(event) {
      this.emit('viewportChange', event);
    }

    /**
     * Метод возвращает колбек, который резолвится, когда контейнер входит во вьюпорт сверху
     * @param {Boolean} options.lazy - Включить ленивую загрузку
     * @param {Number} options.offset - Оффсет для ленивой загрузки
     * @return {Promise}
     */

  }, {
    key: 'whenEnterViewportFromTop',
    value: function whenEnterViewportFromTop(_ref) {
      var _this = this;

      var _ref$lazy = _ref.lazy,
          lazy = _ref$lazy === undefined ? false : _ref$lazy,
          _ref$offset = _ref.offset,
          offset = _ref$offset === undefined ? 300 : _ref$offset;

      var vpOptions = { offset: offset, compliantScrollDown: true };
      if (!lazy) this._ready = _promise2.default.resolve();else if (!this._ready) if ((0, _viewport.isVisible)(this.element, vpOptions)) this._ready = _promise2.default.resolve();else this._ready = new _promise2.default(function (resolve) {
        _this._subscribeScroll();
        var onScroll = function onScroll() {
          if ((0, _viewport.isVisible)(_this.element, vpOptions)) {
            _this.removeListener('viewportChange', onScroll);
            resolve();
          }
        };
        _this.on('viewportChange', onScroll);
      });
      return this._ready;
    }
  }]);
  return Container;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'destroy', [_coreDecorators.autobind, _decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, 'destroy'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_subscribeScroll', [_decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, '_subscribeScroll'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onScroll', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class2.prototype, '_onScroll'), _class2.prototype)), _class2)) || _class);
exports.default = Container;