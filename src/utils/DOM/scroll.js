import easingEquations from 'easing-js'

const requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  ((callback) => setTimeout(callback, 1000 / 60))

/**
 * Установить новое значения скролла для элемента
 */
export function setScroll(element, value) {
  if (element === document.body || element === document.documentElement)
    window.scrollTo(0, value)
  else
    element.scrollTop = value
}

/**
 * Получить текущий скролл элемента
 */
export function getScroll(element) {
  if (element === document.body || element === document.documentElement)
    return document.body.scrollTop || document.documentElement.scrollTop
  return element.scrollTop
}

export function scrollToTop(element, scrollTargetY, duration = 200, easing = 'easeIn') {
  return new Promise((resolve) => {
    const linear = ((pos) => pos)
    const scrollY = getScroll(element)
    let currentTime = 0
    scrollTargetY = Math.max(scrollTargetY, 0)

    // min time .1, max time .8 seconds
    // const time = Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / duration, 0.8))

    function tick() {
      currentTime += 1 / 60

      const p = currentTime / (duration / 1e3)
      const t = (easingEquations[easing] || linear)(p)

      if (p < 1) {
        requestAnimFrame(tick)
        const resScroll = Math.round(scrollY + ((scrollTargetY - scrollY) * t))
        setScroll(element, resScroll)
      } else {
        setScroll(element, scrollTargetY)
        resolve()
      }
    }

    tick()
  })

}

