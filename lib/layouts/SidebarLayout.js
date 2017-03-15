'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _BaseLayout2 = require('./BaseLayout');

var _BaseLayout3 = _interopRequireDefault(_BaseLayout2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmbedLayout = function (_BaseLayout) {
  (0, _inherits3.default)(EmbedLayout, _BaseLayout);

  function EmbedLayout() {
    (0, _classCallCheck3.default)(this, EmbedLayout);
    return (0, _possibleConstructorReturn3.default)(this, (EmbedLayout.__proto__ || (0, _getPrototypeOf2.default)(EmbedLayout)).apply(this, arguments));
  }

  (0, _createClass3.default)(EmbedLayout, [{
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