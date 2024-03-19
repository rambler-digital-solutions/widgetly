import EventEmitter from 'events'
import domready from 'domready'
import debounce from 'lodash.debounce'
import type {Callback, Debounce} from '../../types'
import {scrollToTop, getScroll} from './scroll'

let mutationEventsParams: MutationObserverInit = {
  childList: true,
  subtree: true
}
let observing = false

/**
 * Создаем mutationObserver
 */
export const mutationEvents = new EventEmitter()
const mutationObserver = new MutationObserver((event) => {
  mutationEvents.emit('mutation', event)
})

/**
 * Выставляем параметры для mutationObserver
 */
export function setMutationParams(params: MutationObserverInit) {
  mutationEventsParams = params

  if (observing) {
    initObserve()
  }
}

/**
 * Начать смотреть за DOM
 */
function initObserve() {
  if (observing) {
    mutationObserver.disconnect()
  }

  const observedNode = document.body ?? document.documentElement

  mutationObserver.observe(observedNode, mutationEventsParams)
  observing = true
}

/**
 * Следим за scroll окно
 */
export const globalViewportEvents = new EventEmitter()

const onViewportChangeHandler = (event: Event) => {
  globalViewportEvents.emit('change', event)
}

window.addEventListener('scroll', onViewportChangeHandler)
window.addEventListener('resize', onViewportChangeHandler)

export interface ViewportManager {
  destroy(): void
}

/**
 * Создает менеджер, который следит за изменением viewport элемента
 *
 * @param element Элемент
 * @param callback Колбек изменения вьюпорта
 * @param duration Функция замедления вызова колбека или время задержки вызова коллбека, по-умолчанию 200
 */
export function createViewportManager(
  element: HTMLElement,
  callback: Callback,
  duration: number | Debounce = 200
): ViewportManager {
  const debouncedCallback =
    typeof duration === 'function'
      ? duration(callback)
      : debounce(callback, duration)

  let parent: HTMLElement
  let subscribedOnParentScroll = false

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
 *
 * @param element DOM-элемент, который отслеживаем
 * @param callback Функция-обработчик
 */
export function onRemoveFromDOM(element: HTMLElement, callback: Callback) {
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
 *
 * @param element DOM-элемент
 */
export function removeFromDOM(element: HTMLElement) {
  element.parentNode?.removeChild(element)
}

/**
 * Проверяет, находится ли элемент в DOM
 *
 * @param element DOM-элемент
 */
function isElementInDOM(element: HTMLElement) {
  return document.body.contains(element)
}

type ClassName = string | null | false | undefined

/**
 * Выставить класс элементу
 *
 * @param element DOM элемент
 * @param classNames CSS-классы
 */
export function setClass(element: HTMLElement, ...classNames: ClassName[]) {
  if (element) {
    element.className = classNames.filter(Boolean).join(' ')
  }
}

/**
 * Добавить класс элементу
 *
 * @param element DOM элемент
 * @param classNames CSS-классы
 */
function addClass(element?: HTMLElement, ...classNames: ClassName[]) {
  element?.classList.add(...(classNames.filter(Boolean) as string[]))
}

/**
 * Удалить класс у элемента
 *
 * @param element DOM элемент
 * @param classNames CSS-классы
 */
function removeClass(element?: HTMLElement, ...classNames: ClassName[]) {
  element?.classList.remove(...(classNames.filter(Boolean) as string[]))
}

/**
 * Добавить/удалить классы у элемента
 *
 * @param element DOM элемент
 * @param add Флаг, указывающий добавить или удалить класс
 * @param classNames CSS-классы для добавления/удаления
 *
 * ```ts
 * // добавить класс 'my-class'
 * toggleClass(element, true, 'my-class')
 *
 * // удалить классы 'my-class', 'other-class'
 * toggleClass(element, false, 'my-class', 'other-class')
 * ```
 */
export function toggleClass(
  element: HTMLElement,
  add: boolean,
  ...classNames: ClassName[]
) {
  if (add) {
    addClass(element, ...classNames)
  } else {
    removeClass(element, ...classNames)
  }
}

/**
 * Найти DOM-элемент по его id
 *
 * @param  id ID искомого элемента
 * @param  parent Элемент, внутри которого нужно искать
 */
export function findById(id: string, parent?: HTMLElement) {
  if (!parent) {
    return document.getElementById(id)
  }

  return parent.querySelector(`[id="${id}"]`)
}

/**
 * Подскроллить к позиции относительно верхнего левого угла элемента
 *
 * @param element DOM-элемент
 * @param top Отступ сверху относительно верхнего левого угла элемента
 * @param duration Время анимации
 */
export function scrollByElementTo(
  element: HTMLElement,
  top: number,
  duration = 200
) {
  const parent = findScrollableParent(element)

  if (!parent || parent === element) {
    return
  }

  const {top: elementTop} = element.getBoundingClientRect()
  const {top: parentTop} = parent.getBoundingClientRect()
  let newScrollTop = elementTop - parentTop + top

  if (parent !== document.body && parent !== document.documentElement) {
    newScrollTop += getScroll(parent)
  }

  return scrollToTop(parent, newScrollTop, duration)
}

function findScrollableParent(
  element: HTMLElement,
  noCheckScrollHeight = false
) {
  const {parentElement} = element

  if (!parentElement || parentElement === document.documentElement) {
    return document.documentElement
  }

  if (
    noCheckScrollHeight ||
    parentElement.scrollHeight > parentElement.clientHeight ||
    parentElement === document.body ||
    parentElement === document.documentElement
  ) {
    const {overflowY} = getComputedStyle(parentElement)

    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parentElement
    }
  }

  return findScrollableParent(parentElement, noCheckScrollHeight)
}

domready(initObserve)
