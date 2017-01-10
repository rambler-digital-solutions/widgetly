'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.viewportEvents = exports.mutationObserver = exports.mutationEvents = undefined;
exports.onRemoveFromDOM = onRemoveFromDOM;
exports.removeFromDOM = removeFromDOM;
exports.isElementInDOM = isElementInDOM;
exports.inViewport = inViewport;
exports.setClass = setClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.findById = findById;
exports.scrollByElementTo = scrollByElementTo;

require('classlist.js');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _domready = require('domready');

var _domready2 = _interopRequireDefault(_domready);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _scroll = require('./scroll');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Дополнительные хелперы
                                                                                                                                                                                                     */


var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || function (callback) {
  var interval = void 0;
  return {
    observe: function observe() {
      interval = setInterval(callback, 2e3);
    },
    disconnect: function disconnect() {
      clearInterval(interval);
    }
  };
};

/**
 * Создаем mutationObserver
 */
var mutationEvents = exports.mutationEvents = new _events2.default();
var mutationObserver = exports.mutationObserver = new MutationObserver(function (e) {
  return mutationEvents.emit('mutation', e);
});

/**
 * Следим за scroll окно
 */
var viewportEvents = exports.viewportEvents = new _events2.default();
var onViewportChangeHandler = (0, _throttle2.default)(function (e) {
  return viewportEvents.emit('change', e);
}, 150);
window.addEventListener('scroll', onViewportChangeHandler);
window.addEventListener('resize', onViewportChangeHandler);

/**
 * Обработчик удаления элемента из DOM
 * @param {HTMLElement} element - DOM-элемент, который отслеживаем
 * @param {Function} callback - Функция-обработчик
 */
function onRemoveFromDOM(element, callback) {
  if (isElementInDOM(element)) mutationEvents.on('mutation', onMutation);

  function onMutation() {
    if (!isElementInDOM(element)) {
      mutationEvents.removeListener('mutation', onMutation);
      callback();
    }
  }
}

/**
 * Удаляет элемент из DOM, если он есть в DOM
 * @param  {HTMLElement} element - DOM-элемент
 */
function removeFromDOM(element) {
  if (element.parentNode) element.parentNode.removeChild(element);
}

function isElementInDOM(element) {
  return document.body.contains(element);
}

/**
 * Проверяет, находится ли элемент в видимой области экрана (если элемент выше видимой части, считается что он в ней)
 * @param {HTMLElement} element - Элемент
 * @param {Number} offset - Оффсет
 * @return {Boolean}
 */
function inViewport(element, offset) {
  return element.getBoundingClientRect().top - offset < window.innerHeight;
}

/**
 * Выставить класс элементу
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String|Object]} classNames - css-классы
 */
function setClass(element) {
  for (var _len = arguments.length, classNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    classNames[_key - 1] = arguments[_key];
  }

  if (element) element.className = _classnames2.default.apply(undefined, classNames);
}

/**
 * Добавить класс элементу
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String|Object]} classNames - css-классы
 */
function addClass(element) {
  var _element$classList;

  for (var _len2 = arguments.length, classNames = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    classNames[_key2 - 1] = arguments[_key2];
  }

  if (element) (_element$classList = element.classList).add.apply(_element$classList, _toConsumableArray(_classnames2.default.apply(undefined, classNames).trim().split(/\s+/)));
}

/**
 * Удалить класс у элемента
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String|Object]} classNames - css-классы
 */
function removeClass(element) {
  var _element$classList2;

  for (var _len3 = arguments.length, classNames = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    classNames[_key3 - 1] = arguments[_key3];
  }

  if (element) (_element$classList2 = element.classList).remove.apply(_element$classList2, _toConsumableArray(_classnames2.default.apply(undefined, classNames).trim().split(/\s+/)));
}

/**
 * Добавить/удалить классы у элемента
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String|Object]} classNames - классы для добавления/удаления
 * @param {Boolean} [remove] - флаг, указывающий добавить или удалить класс
 *
 * @example
 * toggleClass(element, {'my-class': true, 'other-class': false}) // удалить класс 'other-class' и добавить класс 'my-class'
 * toggleClass(element, 'my-class', true) // добавить класс 'my-class'
 * toggleClass(element, ['my-class', 'other-class'], false) // удалить классы 'my-class', 'other-class'
 */
function toggleClass(element) {
  for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  var _args$reverse = args.reverse(),
      _args$reverse2 = _toArray(_args$reverse),
      add = _args$reverse2[0],
      classNames = _args$reverse2.slice(1);

  if (typeof add !== 'boolean') (0, _forOwn2.default)(args[0], function (v, k) {
    if (v) addClass(element, k);else removeClass(element, k);
  });else if (add) addClass.apply(undefined, [element].concat(_toConsumableArray(classNames)));else removeClass.apply(undefined, [element].concat(_toConsumableArray(classNames)));
}

/**
 * Найти DOM-элемент по его id
 * @param  {String} id - id искомого элемента
 * @param  {HTMLElement} [parent] - элемент, внутри которого нужно искать
 * @return {HTMLElement}
 */
function findById(id, parent) {
  if (!parent) return document.getElementById(id);
  return parent.querySelector('[id="' + id + '"]');
}

/**
 * Подскроллить к позиции относительно верхнего левого угла элемента
 * @param {HTMLElement} element - DOM-элемент
 * @param {Number} top - отступ сверху относительно верхнего левого угла элемента
 * @param {Number} [duration = 50] - время анимации
 */
function scrollByElementTo(element, top) {
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

  var parent = findScrollableParent(element);
  if (!parent || parent === element) return;

  var _element$getBoundingC = element.getBoundingClientRect(),
      elementTop = _element$getBoundingC.top;

  var _parent$getBoundingCl = parent.getBoundingClientRect(),
      parentTop = _parent$getBoundingCl.top;

  var newScrollTop = elementTop - parentTop + top;
  return (0, _scroll.scrollToTop)(parent, newScrollTop, duration);
}

function findScrollableParent(element) {
  if (!element || document === document.documentElement) return document.documentElement;
  if (element.scrollHeight > element.clientHeight || element === document.body || element === document.documentElement) {
    var overflowY = getComputedStyle(element).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return element;
  }
  return findScrollableParent(element.parentNode);
}

(0, _domready2.default)(function () {
  var observedNode = document.body || document.documentElement;
  mutationObserver.observe(observedNode, { childList: true, subtree: true });
});