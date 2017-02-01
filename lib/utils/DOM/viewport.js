function calcStyle(el) {
  return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle
}

function isOverflowed(overflow) {
  return overflow === 'hidden' || overflow === 'scroll' || overflow === 'auto'
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
function calcBox(element, options, calcOverflowed = false) {
  const winHeight = window.innerHeight
  const winWidth = window.innerWidth
  const rect = element.getBoundingClientRect()
  let {left, right, top, bottom} = rect
  if (options.offset) {
    left -= options.offset
    right += options.offset
    top -= options.offset
    bottom += options.offset
  }

  top = Math.max(0, top)
  left = Math.max(0, left)
  top = Math.min(top, winHeight)
  right = Math.min(right, winWidth)

  const width = right - left
  const height = bottom - top
  const visibleWidth = left < 0 ? Math.min(Math.max(0, left + width), winWidth) : Math.max(Math.min(winWidth - left, width), 0)
  const visibleHeight = top < 0 ? Math.min(Math.max(0, top + height), winHeight) : Math.max(Math.min(winHeight - top, height), 0)

  let childOverflowed = {
    horizontal: false,
    vertical: false
  }
  if (calcOverflowed) {
    const {overflowX, overflowY} = calcStyle(element)
    childOverflowed = {
      horizontal: isOverflowed(overflowX),
      vertical: isOverflowed(overflowY)
    }
  }

  let isCompliantVerticalVisible = false
  if (options.compliantScrollDown)
    isCompliantVerticalVisible = bottom <= 0 && height > 0

  return {
    left,
    top,
    rect,
    childOverflowed,
    isCompliantVerticalVisible,
    width: visibleWidth,
    height: visibleHeight,
    isVisible: visibleWidth > 0 && (visibleHeight > 0 || isCompliantVerticalVisible)
  }
}


/**
 * Вычисляет пересечение дочернего бокса с родительским
 * @param {Object} childBox - Дочерний бокс
 * @param {Object} parentBox - Родительский бокс
 * @param {Object} options - опции
 * @return {Object} - Возвращает результирующий дочерний бокс
 */
function calcResultChildBox(childBox, parentBox) {
  if (!parentBox.childOverflowed.horizontal && !parentBox.childOverflowed.vertical)
    return childBox

  let {width, height, left, top, right, bottom} = childBox
  const {childOverflowed, rect} = childBox

  if (parentBox.childOverflowed.vertical) {
    top = Math.max(top, parentBox.top)
    bottom = Math.min(top + height, parentBox.top + parentBox.height)
    height = Math.max(bottom - top, 0)
  }

  if (parentBox.childOverflowed.horizontal) {
    left = Math.max(left, parentBox.left)
    right = Math.min(left + width, parentBox.left + parentBox.width)
    width = Math.max(right - left, 0)
  }

  return {
    left,
    top,
    width,
    height,
    childOverflowed,
    rect,
    isVisible: childBox.isVisible && parentBox.isVisible && width > 0 &&
      (height > 0 || childBox.isCompliantVerticalVisible && parentBox.isCompliantVerticalVisible)
  }
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
export function calcVisibleOptions(element, options = {}) {
  let currentBox = calcBox(element, options)
  let parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (!currentBox.isVisible)
      break
    currentBox = calcResultChildBox(currentBox, calcBox(parent, options, true))
    parent = parent.parentElement
  }

  // const invisibleArea = { left: 0, top: 0, width: 0, height: 0 }
  const result = {
    isVisible: currentBox.isVisible,
    area: {
      left: currentBox.left - currentBox.rect.left,
      top: currentBox.top - currentBox.rect.top,
      width: currentBox.width,
      height: currentBox.height
    }
  }
  return result
}


export function isVisible(element, options = {}) {
  return calcVisibleOptions(element, options).isVisible
}


export function getVisibleArea(element, options = {}) {
  return calcVisibleOptions(element, options).area
}
