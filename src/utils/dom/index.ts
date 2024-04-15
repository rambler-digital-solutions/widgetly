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
 * Create a MutationObserver
 */
export const mutationEvents = new EventEmitter()
const mutationObserver = new MutationObserver((event) => {
  mutationEvents.emit('mutation', event)
})

/**
 * Set parameters for mutationObserver
 */
export function setMutationParams(params: MutationObserverInit) {
  mutationEventsParams = params

  if (observing) {
    initObserve()
  }
}

/**
 * Start observing the DOM
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
 * Monitor scroll window
 */
export const globalViewportEvents = new EventEmitter()

const onViewportChangeHandler = (event: Event) => {
  globalViewportEvents.emit('change', event)
}

window.addEventListener('scroll', onViewportChangeHandler)
window.addEventListener('resize', onViewportChangeHandler)

/**
 * Base viewport manager
 */
export interface ViewportManager {
  destroy(): void
}

/**
 * Creates a manager that monitors changes to the viewport of an element
 *
 * @param element An element
 * @param callback A viewport change callback
 * @param duration Function to debounce a callback or callback delay duration, default is 200
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
 * Handler for removing an element from the DOM
 *
 * @param element DOM element being watched
 * @param callback Handler function
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
 * Remove an element from the DOM if it exists in the DOM
 *
 * @param element DOM element
 */
export function removeFromDOM(element: HTMLElement) {
  element.parentNode?.removeChild(element)
}

/**
 * Checks if an element is in the DOM
 *
 * @param element DOM element
 */
function isElementInDOM(element: HTMLElement) {
  return document.body.contains(element)
}

type ClassName = string | null | false | undefined

/**
 * Set classes for an element
 *
 * @param element DOM element
 * @param classNames CSS classes
 */
export function setClass(element: HTMLElement, ...classNames: ClassName[]) {
  if (element) {
    element.className = classNames.filter(Boolean).join(' ')
  }
}

/**
 * Add classes to an element
 *
 * @param element DOM element
 * @param classNames CSS classes
 */
function addClass(element?: HTMLElement, ...classNames: ClassName[]) {
  element?.classList.add(...(classNames.filter(Boolean) as string[]))
}

/**
 * Remove classes from an element
 *
 * @param element DOM element
 * @param classNames CSS classes
 */
function removeClass(element?: HTMLElement, ...classNames: ClassName[]) {
  element?.classList.remove(...(classNames.filter(Boolean) as string[]))
}

/**
 * Toggle classes on an element
 *
 * @param element DOM element
 * @param add Flag to add or remove the class
 * @param classNames CSS classes to toggle
 *
 * ```ts
 * // add class 'my-class'
 * toggleClass(element, true, 'my-class')
 *
 * // remove class 'my-class', 'other-class'
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
 * Find DOM element by its id
 *
 * @param id The id of the element to find
 * @param parent The element within which to search
 */
export function findById(id: string, parent?: HTMLElement) {
  if (!parent) {
    return document.getElementById(id)
  }

  return parent.querySelector(`[id="${id}"]`)
}

/**
 * Scroll to a position relative to top left corner of the element
 *
 * @param element DOM element
 * @param top Top offset relative to top left corner of the element
 * @param duration Animation time
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
