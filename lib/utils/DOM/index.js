'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.globalViewportEvents = exports.mutationObserver = exports.mutationEvents = undefined;

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.setMutationParams = setMutationParams;
exports.initObserve = initObserve;
exports.createViewportManager = createViewportManager;
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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _domready = require('domready');

var _domready2 = _interopRequireDefault(_domready);

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _scroll = require('./scroll');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Дополнительные хелперы
 */
var mutationEventsParams = { childList: true, subtree: true };
var observing = false;

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || function MutationObserverPolyfill(callback) {
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
  mutationEvents.emit('mutation', e);
});

/**
 * Выставляем параметры для mutationObserver
 * @param {Object} params - Параметры для mutation-observerf
 */
function setMutationParams(params) {
  mutationEventsParams = params;
  if (observing) initObserve();
}

/**
 * Начать смотреть за DOM
 */
function initObserve() {
  if (observing) mutationObserver.disconnect();
  var observedNode = document.body || document.documentElement;
  mutationObserver.observe(observedNode, mutationEventsParams);
  observing = true;
}

/**
 * Следим за scroll окно
 */
var globalViewportEvents = exports.globalViewportEvents = new _events2.default();
var onViewportChangeHandler = function onViewportChangeHandler(e) {
  globalViewportEvents.emit('change', e);
};
window.addEventListener('scroll', onViewportChangeHandler);
window.addEventListener('resize', onViewportChangeHandler);

/**
 * Создает сущность, которая следит за изменением viewport элемента
 * @param  {HTMLElement} element  - Элемент
 * @param  {Function}    callback - Колбек изменения вьюпорта
 * @return {Object}      Объект со свойством "destroy"
 */
function createViewportManager(element, callback) {
  var debouncedCallback = (0, _debounce2.default)(callback, 200);
  var parent = void 0;
  var subscribedOnParentScroll = void 0;
  if (element) {
    parent = findScrollableParent(element, true);
    if (parent && parent !== document.body && parent !== document.documentElement) {
      parent.addEventListener('scroll', debouncedCallback, false);
      subscribedOnParentScroll = true;
    }
  }
  globalViewportEvents.on('change', debouncedCallback);
  return {
    destroy: function destroy() {
      globalViewportEvents.removeListener('change', debouncedCallback);
      if (subscribedOnParentScroll) parent.removeEventListener('scroll', debouncedCallback, false);
    }
  };
}

/**
 * Обработчик удаления элемента из DOM
 * @param {HTMLElement} element - DOM-элемент, который отслеживаем
 * @param {Function} callback - Функция-обработчик
 */
function onRemoveFromDOM(element, callback) {
  var prevElementInDom = isElementInDOM(element);
  var onMutation = (0, _debounce2.default)(function () {
    var elementInDom = isElementInDOM(element);
    if (!elementInDom && prevElementInDom) {
      mutationEvents.removeListener('mutation', onMutation);
      callback();
    }
    prevElementInDom = elementInDom;
  });
  mutationEvents.on('mutation', onMutation);
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

  if (element) (_element$classList = element.classList).add.apply(_element$classList, (0, _toConsumableArray3.default)(_classnames2.default.apply(undefined, classNames).trim().split(/\s+/)));
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

  if (element) (_element$classList2 = element.classList).remove.apply(_element$classList2, (0, _toConsumableArray3.default)(_classnames2.default.apply(undefined, classNames).trim().split(/\s+/)));
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
      _args$reverse2 = (0, _toArray3.default)(_args$reverse),
      add = _args$reverse2[0],
      classNames = _args$reverse2.slice(1);

  if (typeof add !== 'boolean') (0, _forOwn2.default)(args[0], function (v, k) {
    if (v) addClass(element, k);else removeClass(element, k);
  });else if (add) addClass.apply(undefined, [element].concat((0, _toConsumableArray3.default)(classNames)));else removeClass.apply(undefined, [element].concat((0, _toConsumableArray3.default)(classNames)));
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
  if (parent !== document.body && parent !== document.documentElement) newScrollTop += (0, _scroll.getScroll)(parent);
  return (0, _scroll.scrollToTop)(parent, newScrollTop, duration);
}

function findScrollableParent(element, noCheckScrollHeight) {
  element = element.parentElement;
  if (!element || element === document.documentElement) return document.documentElement;
  if (noCheckScrollHeight || element.scrollHeight > element.clientHeight || element === document.body || element === document.documentElement) {
    var overflowY = getComputedStyle(element).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return element;
  }
  return findScrollableParent(element, noCheckScrollHeight);
}

(0, _domready2.default)(initObserve);