/**
 * Дополнительные хелперы
 */
import domready from 'domready'
import debounce from 'lodash.debounce'
import EventEmitter from 'events'
import {scrollToTop, getScroll} from './scroll'

let mutationEventsParams = {childList: true, subtree: true}
let observing = false

const MutationObserver =
  window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver ||
  function MutationObserverPolyfill(callback) {
    let interval
    return {
      observe() {
        interval = setInterval(callback, 2e3)
      },
      disconnect() {
        clearInterval(interval)
      }
    }
  }

/**
 * Создаем mutationObserver
 */
export const mutationEvents = new EventEmitter()
export const mutationObserver = new MutationObserver(e => {
  mutationEvents.emit('mutation', e)
})

/**
 * Выставляем параметры для mutationObserver
 * @param {Object} params - Параметры для mutation-observerf
 */
export function setMutationParams(params) {
  mutationEventsParams = params
  if (observing) initObserve()
}

/**
 * Начать смотреть за DOM
 */
export function initObserve() {
  if (observing) mutationObserver.disconnect()
  const observedNode = document.body || document.documentElement
  mutationObserver.observe(observedNode, mutationEventsParams)
  observing = true
}

/**
 * Следим за scroll окно
 */
export const globalViewportEvents = new EventEmitter()
const onViewportChangeHandler = e => {
  globalViewportEvents.emit('change', e)
}
window.addEventListener('scroll', onViewportChangeHandler)
window.addEventListener('resize', onViewportChangeHandler)

/**
 * Создает сущность, которая следит за изменением viewport элемента
 * @param  {HTMLElement} element  - Элемент
 * @param  {Function}    callback - Колбек изменения вьюпорта
 * @param  {Number | Function}      duration - время задержки вызова коллбека, по-умолчанию 200 или колбэк,  который осуществляет замедление
 * @return {Object}      Объект со свойством "destroy"
 */
export function createViewportManager(element, callback, duration = 200) {
  const debouncedCallback =
    typeof duration === 'function'
      ? duration(callback)
      : debounce(callback, duration)

  let parent
  let subscribedOnParentScroll
  if (element) {
    parent = findScrollableParent(element, true)
    if (
      parent &&
      parent !== document.body &&
      parent !== document.documentElement
    ) {
      parent.addEventListener('scroll', debouncedCallback, false)
      subscribedOnParentScroll = true
    }
  }
  globalViewportEvents.on('change', debouncedCallback)
  return {
    destroy() {
      globalViewportEvents.removeListener('change', debouncedCallback)
      if (subscribedOnParentScroll)
        parent.removeEventListener('scroll', debouncedCallback, false)
    }
  }
}

/**
 * Обработчик удаления элемента из DOM
 * @param {HTMLElement} element - DOM-элемент, который отслеживаем
 * @param {Function} callback - Функция-обработчик
 */
export function onRemoveFromDOM(element, callback) {
  let prevElementInDom = isElementInDOM(element)
  const onMutation = debounce(() => {
    const elementInDom = isElementInDOM(element)
    if (!elementInDom && prevElementInDom) {
      mutationEvents.removeListener('mutation', onMutation)
      callback()
    }
    prevElementInDom = elementInDom
  })
  mutationEvents.on('mutation', onMutation)
}

/**
 * Удаляет элемент из DOM, если он есть в DOM
 * @param  {HTMLElement} element - DOM-элемент
 */
export function removeFromDOM(element) {
  if (element.parentNode) element.parentNode.removeChild(element)
}

export function isElementInDOM(element) {
  return document.body.contains(element)
}

/**
 * Проверяет, находится ли элемент в видимой области экрана (если элемент выше видимой части, считается что он в ней)
 * @param {HTMLElement} element - Элемент
 * @param {Number} offset - Оффсет
 * @return {Boolean}
 */
export function inViewport(element, offset) {
  return element.getBoundingClientRect().top - offset < window.innerHeight
}

/**
 * Выставить класс элементу
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String]} classNames - css-классы
 */
export function setClass(element, ...classNames) {
  if (element) element.className = classNames.filter(Boolean).join(' ')
}

/**
 * Добавить класс элементу
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String]} classNames - css-классы
 */
export function addClass(element, ...classNames) {
  if (element) element.classList.add(...classNames.filter(Boolean))
}

/**
 * Удалить класс у элемента
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String]} classNames - css-классы
 */
export function removeClass(element, ...classNames) {
  if (element) element.classList.remove(...classNames.filter(Boolean))
}

/**
 * Добавить/удалить классы у элемента
 * @param {HTMLElement} element - DOM элемент
 * @param {...[String]} classNames - классы для добавления/удаления
 * @param {Boolean} add - флаг, указывающий добавить или удалить класс
 *
 * @example
 * toggleClass(element, 'my-class', true) // добавить класс 'my-class'
 * toggleClass(element, ['my-class', 'other-class'], false) // удалить классы 'my-class', 'other-class'
 */
export function toggleClass(element, ...args) {
  const [add, ...classNames] = args.reverse()
  if (add) addClass(element, ...classNames)
  else removeClass(element, ...classNames)
}

/**
 * Найти DOM-элемент по его id
 * @param  {String} id - id искомого элемента
 * @param  {HTMLElement} [parent] - элемент, внутри которого нужно искать
 * @return {HTMLElement}
 */
export function findById(id, parent) {
  if (!parent) return document.getElementById(id)
  return parent.querySelector(`[id="${id}"]`)
}

/**
 * Подскроллить к позиции относительно верхнего левого угла элемента
 * @param {HTMLElement} element - DOM-элемент
 * @param {Number} top - отступ сверху относительно верхнего левого угла элемента
 * @param {Number} [duration = 50] - время анимации
 */
export function scrollByElementTo(element, top, duration = 200) {
  const parent = findScrollableParent(element)
  if (!parent || parent === element) return
  const {top: elementTop} = element.getBoundingClientRect()
  const {top: parentTop} = parent.getBoundingClientRect()
  let newScrollTop = elementTop - parentTop + top
  if (parent !== document.body && parent !== document.documentElement)
    newScrollTop += getScroll(parent)
  return scrollToTop(parent, newScrollTop, duration)
}

function findScrollableParent(element, noCheckScrollHeight) {
  element = element.parentElement
  if (!element || element === document.documentElement)
    return document.documentElement
  if (
    noCheckScrollHeight ||
    element.scrollHeight > element.clientHeight ||
    element === document.body ||
    element === document.documentElement
  ) {
    const overflowY = getComputedStyle(element).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return element
  }
  return findScrollableParent(element, noCheckScrollHeight)
}

domready(initObserve)
