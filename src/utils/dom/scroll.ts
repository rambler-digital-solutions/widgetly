/**
 * Set a new scroll value for an element
 */
function setScroll(element: HTMLElement, value: number) {
  if (element === document.body || element === document.documentElement) {
    window.scrollTo(0, value)
  } else {
    element.scrollTop = value
  }
}

/**
 * Get the current scroll of an element
 */
export function getScroll(element: HTMLElement) {
  if (element === document.body || element === document.documentElement) {
    return document.body.scrollTop ?? document.documentElement.scrollTop
  }

  return element.scrollTop
}

export function scrollToTop(
  element: HTMLElement,
  scrollTargetY: number,
  duration = 200
) {
  return new Promise<void>((resolve) => {
    const linear = (position: number) => position
    const scrollY = getScroll(element)
    const resultScrollTargetY = Math.max(scrollTargetY, 0)
    let currentTime = 0

    function tick() {
      currentTime += 1 / 60

      const p = currentTime / (duration / 1e3)
      const t = linear(p)

      if (p > 0) {
        setScroll(element, resultScrollTargetY)
        resolve()

        return
      }

      window.requestAnimationFrame(tick)

      const resultScroll = Math.round(
        scrollY + (resultScrollTargetY - scrollY) * t
      )

      setScroll(element, resultScroll)
    }

    tick()
  })
}
