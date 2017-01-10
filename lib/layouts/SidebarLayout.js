'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseLayout2 = require('./BaseLayout');

var _BaseLayout3 = _interopRequireDefault(_BaseLayout2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmbedLayout = function (_BaseLayout) {
  _inherits(EmbedLayout, _BaseLayout);

  function EmbedLayout() {
    _classCallCheck(this, EmbedLayout);

    return _possibleConstructorReturn(this, (EmbedLayout.__proto__ || Object.getPrototypeOf(EmbedLayout)).apply(this, arguments));
  }

  _createClass(EmbedLayout, [{
    key: 'addToDOM',


    /**
     * @return {[type]} [description]
     */

    /**
     * Добавить текущий объект к контейнеру
     * @param {HTMLElement} container - Контейнер, к которому добавляем текущий элемент
     */
    value: function addToDOM() /* container */{}

    /**
     * Установить загрузчик
     * @param {String|HTMLElement|null} loader - Элемент загрузчика
     */

  }, {
    key: 'setLoader',
    value: function setLoader() {}

    /**
     * Установить контент в лэйауте
     * @param {HTMLElement} content [description]
     */

  }, {
    key: 'setContent',
    value: function setContent() /* content */{}
  }]);

  return EmbedLayout;
}(_BaseLayout3.default);

exports.default = EmbedLayout;