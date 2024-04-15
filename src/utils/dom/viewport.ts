function calculateStyle(element: HTMLElement) {
  return window.getComputedStyle?.(element)
}

function isOverflowed(overflow: string) {
  return overflow === 'hidden' || overflow === 'scroll' || overflow === 'auto'
}

interface CalculateOptions {
  /** Margin to consider the element visible by default is 0 */
  offset?: number
  /** Flag indicating that if the viewport is below the element, then we consider the element visible, default false */
  compliantScrollDown?: boolean
}

interface Overflowed {
  vertical: boolean
  horizontal: boolean
}

interface CalculateBox {
  left: number
  top: number
  right?: number
  bottom?: number
  width: number
  height: number
  rect: DOMRect
  childOverflowed: Overflowed
  isCompliantVerticalVisible?: boolean
  isVisible: boolean
}

/**
 * Calculates the area of the element that is visible on screen. Returns the calculated box.
 *
 * @param element DOM element for which to calculate the intersection
 * @param options Options
 * @param calculateOverflowed Calculate css overflow properties
 */
function calculateBox(
  element: HTMLElement,
  options: CalculateOptions,
  calculateOverflowed = false
): CalculateBox {
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
  const visibleWidth =
    left < 0
      ? Math.min(Math.max(0, left + width), winWidth)
      : Math.max(Math.min(winWidth - left, width), 0)
  const visibleHeight =
    top < 0
      ? Math.min(Math.max(0, top + height), winHeight)
      : Math.max(Math.min(winHeight - top, height), 0)

  let childOverflowed = {
    horizontal: false,
    vertical: false
  }

  if (calculateOverflowed) {
    const {overflowX, overflowY} = calculateStyle(element)

    childOverflowed = {
      horizontal: isOverflowed(overflowX),
      vertical: isOverflowed(overflowY)
    }
  }

  const isCompliantVerticalVisible = options.compliantScrollDown
    ? bottom <= 0 && height > 0
    : false

  return {
    left,
    top,
    rect,
    childOverflowed,
    isCompliantVerticalVisible,
    width: visibleWidth,
    height: visibleHeight,
    isVisible:
      visibleWidth > 0 && (visibleHeight > 0 || isCompliantVerticalVisible)
  }
}

/**
 * Calculates the intersection of a child box with a parent box. Returns the resulting child box.
 *
 * @param childBox Child box
 * @param parentBox Parent box
 */
function calculateResultChildBox(
  childBox: CalculateBox,
  parentBox: CalculateBox
): CalculateBox {
  if (
    !parentBox.childOverflowed.horizontal &&
    !parentBox.childOverflowed.vertical
  ) {
    return childBox
  }

  const {childOverflowed, rect} = childBox
  let {width, height, left, top, right, bottom} = childBox

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
    isVisible:
      childBox.isVisible &&
      parentBox.isVisible &&
      width > 0 &&
      (height > 0 ||
        (!!childBox.isCompliantVerticalVisible &&
          !!parentBox.isCompliantVerticalVisible))
  }
}

/** Visible area */
export interface VisibleArea {
  /** Coordinates relative to the top left corner of the element from which it is visible */
  top: number
  /** Coordinates relative to the top left corner of the element from which it is visible */
  left: number
  /** Visible width of the element */
  width: number
  /** Visible height of the element */
  height: number
}

interface VisibleOptions {
  /** Determines if the element is visible on screen */
  isVisible: boolean
  /** Visible area of the DOM element */
  area: VisibleArea
}

/**
 * Determines the visible parts of the element.
 *
 * @param element DOM element
 * @param options Options
 */
function calculateVisibleOptions(
  element: HTMLElement,
  options: CalculateOptions = {}
): VisibleOptions {
  let currentBox = calculateBox(element, options)
  let parent = element.parentElement

  while (
    parent &&
    parent !== document.body &&
    parent !== document.documentElement
  ) {
    if (!currentBox.isVisible) {
      break
    }

    currentBox = calculateResultChildBox(
      currentBox,
      calculateBox(parent, options, true)
    )
    parent = parent.parentElement
  }

  return {
    isVisible: currentBox.isVisible,
    area: {
      left: currentBox.left - currentBox.rect.left,
      top: currentBox.top - currentBox.rect.top,
      width: currentBox.width,
      height: currentBox.height
    }
  }
}

export function isVisible(
  element: HTMLElement,
  options: CalculateOptions = {}
) {
  return calculateVisibleOptions(element, options).isVisible
}

export function getVisibleArea(
  element: HTMLElement,
  options: CalculateOptions = {}
) {
  return calculateVisibleOptions(element, options).area
}
