'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _desc, _value, _class; // Модальный лэйаут, сразу показывается

var _BaseLayout2 = require('./BaseLayout');

var _BaseLayout3 = _interopRequireDefault(_BaseLayout2);

var _OverlayLayout = require('./OverlayLayout.css');

var _OverlayLayout2 = _interopRequireDefault(_OverlayLayout);

var _decorators = require('../utils/decorators');

var _DOM = require('../utils/DOM');

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

var ANIMATION_DURATION = 200;

var OverlayLayout = (_class = function (_BaseLayout) {
  (0, _inherits3.default)(OverlayLayout, _BaseLayout);

  /**
   * @param {Object} config - опции
   * @param {String} [config.spinner] - HTML шаблон спиннера
   * @param {String} [config.className] - css-класс, который добавляем к элементу
   * @param {Number} [config.animationDuration = 200] - длительность opacity анимации в ms
   */
  function OverlayLayout() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, OverlayLayout);

    var _this = (0, _possibleConstructorReturn3.default)(this, (OverlayLayout.__proto__ || (0, _getPrototypeOf2.default)(OverlayLayout)).call(this, config));

    if (_this.config.animationDuration === undefined) _this.config.animationDuration = ANIMATION_DURATION;
    _this.spinner = config.spinner;
    _this.element = document.createElement('div');
    _this.contentId = _this.id + '_content';
    _this.loaderId = _this.id + '_loader';
    _this.element.innerHTML = '\n      <div class="' + _OverlayLayout2.default.OverlayLayout__wrapper + '">\n        ' + (_this.spinner ? '<div class="' + _OverlayLayout2.default.Loader + '" id="' + _this.contentId + '">' + _this.spinner + '</div>' : '') + '\n        <div class="' + _OverlayLayout2.default.OverlayLayout__content + '" id="' + _this.contentId + '"></div>\n      </div>\n    ';
    _this.contentElement = (0, _DOM.findById)(_this.contentId, _this.element);
    _this.loaderElement = (0, _DOM.findById)(_this.loaderId, _this.element);
    (0, _DOM.setClass)(_this.element, _OverlayLayout2.default.OverlayLayout, _OverlayLayout2.default['is-hidden'], config.className, !!_this.config.animationDuration && _OverlayLayout2.default['no-animate']);
    (0, _DOM.onRemoveFromDOM)(_this.element, _this.destroy);
    return _this;
  }

  /**
   * Показать текущий лэйаут
   */


  (0, _createClass3.default)(OverlayLayout, [{
    key: 'addToDOM',
    value: function addToDOM() {
      if (this.config.hidden) {
        this.moveBehind();
        this.hide();
      }
      this.container = document.body;
      this.container.appendChild(this.getElement());
    }

    /**
     * Показать загрузчик
     */

  }, {
    key: 'showLoading',
    value: function showLoading() {
      this.toggleLoading(true);
    }

    /**
     * Скрыть загрузчик
     */

  }, {
    key: 'hideLoading',
    value: function hideLoading() {
      this.toggleLoading(false);
    }
  }, {
    key: 'moveBehind',
    value: function moveBehind() {
      (0, _DOM.toggleClass)(this.element, _OverlayLayout2.default['is-behind'], true);
    }
  }, {
    key: 'moveFront',
    value: function moveFront() {
      (0, _DOM.toggleClass)(this.element, _OverlayLayout2.default['is-behind'], false);
    }

    /**
     * Скрыть лэйаут
     */

  }, {
    key: 'hide',
    value: function hide() {
      (0, _DOM.toggleClass)(this.element, _OverlayLayout2.default['is-hidden'], true);
      clearTimeout(this.moveBehindTimeout);
      this.moveBehindTimeout = setTimeout(this.moveBehind, this.config.animationDuration);
    }

    /**
     * Показать лэйаут
     */

  }, {
    key: 'show',
    value: function show() {
      (0, _DOM.toggleClass)(this.element, _OverlayLayout2.default['is-hidden'], false);
      clearTimeout(this.moveBehindTimeout);
      this.moveFront();
    }

    /**
     * Показать/скрыть лоадер
     * @param {Boolean} show - Флаг скрытия/показа лоадера
     */

  }, {
    key: 'toggleLoading',
    value: function toggleLoading(show) {
      (0, _DOM.toggleClass)(this.element, _OverlayLayout2.default['is-loading'], show);
      (0, _DOM.toggleClass)(this.loaderElement, _OverlayLayout2.default['is-shown'], show);
    }

    /**
     * Установить контент в лэйауте
     * @param {ContentElement} content - Контент лэйаута
     */

  }, {
    key: 'setContent',
    value: function setContent(content) {
      this.content = content;
      this.contentElement.appendChild(content.getElement());
    }

    /**
     * Удаление элемента из DOM
     * В этот момент происходит отписка от событий
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      clearTimeout(this.moveBehindTimeout);
      (0, _DOM.removeFromDOM)(this.element);
      this.emit('destroy');
    }
  }]);
  return OverlayLayout;
}(_BaseLayout3.default), (_applyDecoratedDescriptor(_class.prototype, 'moveBehind', [_decorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'moveBehind'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'moveFront', [_decorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'moveFront'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'destroy', [_decorators.autobind, _decorators.once], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'destroy'), _class.prototype)), _class);
exports.default = OverlayLayout;