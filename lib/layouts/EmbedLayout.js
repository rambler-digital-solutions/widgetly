'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class;

var _BaseLayout2 = require('./BaseLayout');

var _BaseLayout3 = _interopRequireDefault(_BaseLayout2);

var _EmbedLayout = require('./EmbedLayout.css');

var _EmbedLayout2 = _interopRequireDefault(_EmbedLayout);

var _coreDecorators = require('core-decorators');

var _DOM = require('../utils/DOM');

var _decorators = require('../utils/decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var EmbedLayout = (_class = function (_BaseLayout) {
  _inherits(EmbedLayout, _BaseLayout);

  /**
   * @param {String} spinner - HTML шаблон спиннера
   */
  function EmbedLayout() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, EmbedLayout);

    var _this = _possibleConstructorReturn(this, (EmbedLayout.__proto__ || Object.getPrototypeOf(EmbedLayout)).call(this, config));

    _this.spinner = config.spinner || '';
    _this.contentId = _this.id + '_content';
    _this.loaderId = _this.id + '_loader';
    _this.element.innerHTML = '\n      <div class="' + _EmbedLayout2.default.Wrapper + '">\n        ' + (_this.spinner ? '<div class="' + _EmbedLayout2.default.Loader + '" id="' + _this.loaderId + '">' + _this.spinner + '</div>' : '') + '\n        <div class="' + _EmbedLayout2.default.Content + '" id="' + _this.contentId + '"></div>\n      </div>\n    ';
    _this.contentElement = (0, _DOM.findById)(_this.contentId, _this.element);
    _this.loaderElement = (0, _DOM.findById)(_this.loaderId, _this.element);
    (0, _DOM.setClass)(_this.element, _EmbedLayout2.default.EmbedLayout, _EmbedLayout2.default['is-loading']);
    return _this;
  }

  /**
   * Добавить текущий объект к контейнеру
   * @param {Container} container - Контейнер, к которому добавляем текущий элемент
   */


  _createClass(EmbedLayout, [{
    key: 'addToDOM',
    value: function addToDOM(container) {
      this.container = container;
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

    /**
     * Показать/скрыть лоадер
     * @param {Boolean} show - Флаг скрытия/показа лоадера
     */

  }, {
    key: 'toggleLoading',
    value: function toggleLoading(show) {
      (0, _DOM.toggleClass)(this.element, _EmbedLayout2.default['is-loading'], show);
      (0, _DOM.toggleClass)(this.loaderElement, _EmbedLayout2.default['is-shown'], show);
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
      (0, _DOM.removeFromDOM)(this.element);
      this.emit('destroy');
    }
  }]);

  return EmbedLayout;
}(_BaseLayout3.default), (_applyDecoratedDescriptor(_class.prototype, 'destroy', [_coreDecorators.autobind, _decorators.once], Object.getOwnPropertyDescriptor(_class.prototype, 'destroy'), _class.prototype)), _class);
exports.default = EmbedLayout;