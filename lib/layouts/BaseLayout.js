'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _desc, _value, _class2;

var _decorators = require('../utils/decorators');

var _EventEmitter = require('../utils/EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _DOM = require('../utils/DOM');

var _randomId = require('../utils/randomId');

var _randomId2 = _interopRequireDefault(_randomId);

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

/**
 * Класс с базовым layout
 */
var BaseLayout = (_dec = (0, _coreDecorators.mixin)(_EventEmitter2.default.prototype), _dec(_class = (_class2 = function () {
  function BaseLayout(config) {
    _classCallCheck(this, BaseLayout);

    _EventEmitter2.default.call(this);
    this.id = (0, _randomId2.default)();
    this.element = document.createElement('div');
    this.config = config;
    (0, _DOM.onRemoveFromDOM)(this.element, this.destroy);
  }

  _createClass(BaseLayout, [{
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }

    /**
     * @virtual
     * Показать загрузчик (спиннер)
     */

  }, {
    key: 'showLoading',
    value: function showLoading() {}

    /**
     * @virtual
     * Скрыть загрузчик (спиннер)
     */

  }, {
    key: 'hideLoading',
    value: function hideLoading() {}

    /**
     * @virtual
     * Установить контент (или добавить iframe)
     */

  }, {
    key: 'setContent',
    value: function setContent() {}

    /**
     * @virtual
     * Добавить этот лэйаут к элементу
     */

  }, {
    key: 'addToDOM',
    value: function addToDOM() {}

    /**
     * @virtual
     * Скрыть лэйаут (возможно с анимацией)
     */

  }, {
    key: 'hide',
    value: function hide() {}

    /**
     * @virtual
     * Показать лэйаут
     */

  }, {
    key: 'show',
    value: function show() {}

    /**
     * @virtual
     * Удалить лэйаут из DOM
     */

  }, {
    key: 'destroy',
    value: function destroy() {}
  }]);

  return BaseLayout;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'showLoading', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'showLoading'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'hideLoading', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'hideLoading'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'setContent', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'setContent'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'addToDOM', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'addToDOM'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'hide', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'hide'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'show', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'show'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'destroy', [_decorators.virtual], Object.getOwnPropertyDescriptor(_class2.prototype, 'destroy'), _class2.prototype)), _class2)) || _class);
exports.default = BaseLayout;