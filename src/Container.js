import EventEmitter from './utils/EventEmitter'
import {onRemoveFromDOM, viewportEvents} from './utils/DOM'
import {isVisible} from './utils/DOM/viewport'
import {once} from './utils/decorators'
import {autobind, mixin} from 'core-decorators'

@mixin(EventEmitter.prototype)
export default class Container {

  /**
   * Конструктор контейнера
   * @param {HTMLElement} element - DOM-элемент контейнера
   */
  constructor(element) {
    EventEmitter.call(this)
    this.element = element
    this._ready = false
    this.emit('ready')
    onRemoveFromDOM(this.element, this.destroy)
  }

  /**
   * Уничтожить контейнер вручную
   */
  getElement() {
    return this.element
  }

  /**
   * Добавить элемент с контентом
   */
  appendChild(element) {
    this.element.appendChild(element)
  }

  @autobind
  @once
  destroy() {
    this.emit('destroy')
    this.removeAllListeners()
    viewportEvents.removeListener('change', this._onScroll)
  }

  updateViewport() {
    this.emit('viewportChange')
  }

  @once
  _subscribeScroll() {
    viewportEvents.on('change', this._onScroll)
  }

  @autobind
  _onScroll(event) {
    this.emit('viewportChange', event)
  }

  /**
   * Метод возвращает колбек, который резолвится, когда контейнер входит во вьюпорт сверху
   * @param {Boolean} options.lazy - Включить ленивую загрузку
   * @param {Number} options.offset - Оффсет для ленивой загрузки
   * @return {Promise}
   */
  whenEnterViewportFromTop({lazy = false, offset = 300}) {
    const vpOptions = {offset, compliantScrollDown: true}
    if (!lazy)
      this._ready = Promise.resolve()
    else if (!this._ready)
      if (isVisible(this.element, vpOptions))
        this._ready = Promise.resolve()
      else
        this._ready = new Promise((resolve) => {
          this._subscribeScroll()
          const onScroll = () => {
            if (isVisible(this.element, vpOptions)) {
              this.removeListener('viewportChange', onScroll)
              resolve()
            }
          }
          this.on('viewportChange', onScroll)
        })
    return this._ready
  }

}
