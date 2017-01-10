'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _desc, _value, _class2;

var _EventEmitter = require('./utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _DOM = require('./utils/DOM');

var _viewport = require('./utils/DOM/viewport');

var _decorators = require('./utils/decorators');

var _coreDecorators = require('core-decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    _classCallCheck(this, Container);

    _EventEmitter2.default.call(this);
    this.element = element;
    this._ready = false;
    this.emit('ready');
    (0, _DOM.onRemoveFromDOM)(this.element, this.destroy);
  }

  /**
   * Уничтожить контейнер вручную
   */


  _createClass(Container, [{
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
      _DOM.viewportEvents.removeListener('change', this._onScroll);
    }
  }, {
    key: 'updateViewport',
    value: function updateViewport() {
      this.emit('viewportChange');
    }
  }, {
    key: '_subscribeScroll',
    value: function _subscribeScroll() {
      _DOM.viewportEvents.on('change', this._onScroll);
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
      if (!lazy) this._ready = Promise.resolve();else if (!this._ready) if ((0, _viewport.isVisible)(this.element, vpOptions)) this._ready = Promise.resolve();else this._ready = new Promise(function (resolve) {
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
}(), (_applyDecoratedDescriptor(_class2.prototype, 'destroy', [_coreDecorators.autobind, _decorators.once], Object.getOwnPropertyDescriptor(_class2.prototype, 'destroy'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_subscribeScroll', [_decorators.once], Object.getOwnPropertyDescriptor(_class2.prototype, '_subscribeScroll'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, '_onScroll', [_coreDecorators.autobind], Object.getOwnPropertyDescriptor(_class2.prototype, '_onScroll'), _class2.prototype)), _class2)) || _class);
exports.default = Container;