'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calcVisibleOptions = calcVisibleOptions;
exports.isVisible = isVisible;
exports.getVisibleArea = getVisibleArea;
function calcStyle(el) {
  return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
}

function isOverflowed(overflow) {
  return overflow === 'hidden' || overflow === 'scroll' || overflow === 'auto';
}

/**
 * Вычисляет область элемента, которая попадает в экран
 * @param {HTMLElement} element - DOM-элемент, для которого считаем пересечение
 * @param {Object} options - опции
 * @param {Number} [options.offset = 0] - отступ, при пересечении которого считаем что элемент виден
 * @param {Number} [options.compliantScrollDown = false] - флаг указывающий на то,
 * что если вьюпорт ниже элемента, то мы считаем элемент видимым
 * @param {Boolean} calcOverflowed - посчитать css св-ва overflow
 * @return {Object} - возвращает вычесленный бокс
 */
function calcBox(element, options) {
  var calcOverflowed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var winHeight = window.innerHeight;
  var winWidth = window.innerWidth;
  var rect = element.getBoundingClientRect();
  var left = rect.left,
      right = rect.right,
      top = rect.top,
      bottom = rect.bottom;

  if (options.offset) {
    left -= options.offset;
    right += options.offset;
    top -= options.offset;
    bottom += options.offset;
  }

  top = Math.max(0, top);
  left = Math.max(0, left);
  top = Math.min(top, winHeight);
  right = Math.min(right, winWidth);

  var width = right - left;
  var height = bottom - top;
  var visibleWidth = left < 0 ? Math.min(Math.max(0, left + width), winWidth) : Math.max(Math.min(winWidth - left, width), 0);
  var visibleHeight = top < 0 ? Math.min(Math.max(0, top + height), winHeight) : Math.max(Math.min(winHeight - top, height), 0);

  var childOverflowed = {
    horizontal: false,
    vertical: false
  };
  if (calcOverflowed) {
    var _calcStyle = calcStyle(element),
        overflowX = _calcStyle.overflowX,
        overflowY = _calcStyle.overflowY;

    childOverflowed = {
      horizontal: isOverflowed(overflowX),
      vertical: isOverflowed(overflowY)
    };
  }

  var isCompliantVerticalVisible = false;
  if (options.compliantScrollDown) isCompliantVerticalVisible = bottom <= 0 && height > 0;

  return {
    left: left,
    top: top,
    rect: rect,
    childOverflowed: childOverflowed,
    isCompliantVerticalVisible: isCompliantVerticalVisible,
    width: visibleWidth,
    height: visibleHeight,
    isVisible: visibleWidth > 0 && (visibleHeight > 0 || isCompliantVerticalVisible)
  };
}

/**
 * Вычисляет пересечение дочернего бокса с родительским
 * @param {Object} childBox - Дочерний бокс
 * @param {Object} parentBox - Родительский бокс
 * @param {Object} options - опции
 * @return {Object} - Возвращает результирующий дочерний бокс
 */
function calcResultChildBox(childBox, parentBox) {
  if (!parentBox.childOverflowed.horizontal && !parentBox.childOverflowed.vertical) return childBox;

  var width = childBox.width,
      height = childBox.height,
      left = childBox.left,
      top = childBox.top,
      right = childBox.right,
      bottom = childBox.bottom;
  var childOverflowed = childBox.childOverflowed,
      rect = childBox.rect;


  if (parentBox.childOverflowed.vertical) {
    top = Math.max(top, parentBox.top);
    bottom = Math.min(top + height, parentBox.top + parentBox.height);
    height = Math.max(bottom - top, 0);
  }

  if (parentBox.childOverflowed.horizontal) {
    left = Math.max(left, parentBox.left);
    right = Math.min(left + width, parentBox.left + parentBox.width);
    width = Math.max(right - left, 0);
  }

  return {
    left: left,
    top: top,
    width: width,
    height: height,
    childOverflowed: childOverflowed,
    rect: rect,
    isVisible: childBox.isVisible && parentBox.isVisible && width > 0 && (height > 0 || childBox.isCompliantVerticalVisible && parentBox.isCompliantVerticalVisible)
  };
}

/**
 * Определяет видимые части элемента
 * @param {HTMLElement} element - DOM-элемент
 * @param {Object} options - опции
 * @param {Number} [options.offset = 0] - отступ, при пересечении которого считаем что элемент виден
 * @param {Number} [options.compliantScrollDown = false] - флаг указывающий на то,
 * что если вьюпорт ниже элемента, то мы считаем элемент видимым
 * @return {Object} - Объект со следующими полями:
 * - isVisible - определяет виден ли элемент на экране
 * - area - видимая область DOM-элемента
 * - area.left, area.top - координаты относительно легово верхнего угла элемента, начиная с которых он виден
 * - area.width - видимая ширина элемента
 * - area.height - видимая высота элемента
 */
function calcVisibleOptions(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var currentBox = calcBox(element, options);
  var parent = element.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (!currentBox.isVisible) break;
    currentBox = calcResultChildBox(currentBox, calcBox(parent, options, true));
    parent = parent.parentElement;
  }

  // const invisibleArea = { left: 0, top: 0, width: 0, height: 0 }
  var result = {
    isVisible: currentBox.isVisible,
    area: {
      left: currentBox.left - currentBox.rect.left,
      top: currentBox.top - currentBox.rect.top,
      width: currentBox.width,
      height: currentBox.height
    }
  };
  return result;
}

function isVisible(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return calcVisibleOptions(element, options).isVisible;
}

function getVisibleArea(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return calcVisibleOptions(element, options).area;
}