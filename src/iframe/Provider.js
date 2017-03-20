import ContentElement from '../layouts/ContentElement'
import {Provider} from 'magic-transport'
import iframeResizer from 'iframe-resizer/js/iframeResizer'
import {parse as parseUrl} from 'url'
import {autobind, mixin} from 'core-decorators'
import {removeFromDOM, onRemoveFromDOM, createViewportManager} from '../utils/DOM'
import {once} from '../utils/decorators'
import {getVisibleArea} from '../utils/DOM/viewport'
import EventEmitter from '../utils/EventEmitter'

const DEFAULT_OFFSET = 100

@mixin(EventEmitter.prototype)
export default class IFrameProvider extends ContentElement {

  /**
   * Обертка над iframe
   * @param {String} options.url - URL по которому нужно загрузить iframe
   * @param {Widget} options.widget - Объект виджета
   * @param {String} options.id - Уникальный идентификатор виджета
   */
  constructor(url, widget, id) {
    super()
    EventEmitter.call(this)
    // Создаем элемент iframe
    this.id = id
    this.url = url + '#widgetId=' + this.id
    this.widget = widget

    this._destroyed = false

    const {protocol, host} = parseUrl(url)
    if (host)
      this.consumerOrigin = `${protocol}//${host}`
    else
      this.consumerOrigin = location.origin
    this.createElement()
  }

  createElement() {
    this.element = document.createElement('iframe')
    this.element.style.display = 'block !important'
    this.element.setAttribute('frameborder', 'no')
    this.element.setAttribute('width', '100%')
    this.element.src = this.url
    this.element.name = this.id
    onRemoveFromDOM(this.element, this.destroy)
  }

  async initialize() {
    this.transport = new Provider(this.id, this.consumerOrigin, this.widget.externalizeAsProvider())
    this.provider = this.transport.provider
    this.consumer = await new Promise(resolve => this.transport.once('ready', resolve))
    let resizedResolve
    let initResolve
    const resizedPromise = new Promise(resolve => { resizedResolve = resolve })
    const initPromise = new Promise(resolve => { initResolve = resolve })
    this.resizer = iframeResizer({
      targetOrigin: this.consumerOrigin,
      resizedCallback: (() => {
        resizedResolve()
        // Иногда initCallback может не вызваться почему то
        initResolve()
      }),
      initCallback: initResolve
    }, this.element)[0].iFrameResizer

    await Promise.all([
      resizedPromise,
      initPromise,
      this.consumer.initialize()
    ])

    return this.consumer
  }

    /**
   * Функция вызовется при изменении viewport контента (айфрейма)
   * @param {Number} [offset]
   */
  subscribeVisibleAreaChange(offset, callback) {
    if (typeof offset === 'function') {
      callback = offset
      offset = DEFAULT_OFFSET
    }
    this.subscribeViewportChange()
    this.on('viewportChange', () => {
      callback(this.getVisibleArea())
    })
  }


  getVisibleArea() {
    return getVisibleArea(this.element)
  }


  @once
  subscribeViewportChange() {
    this.widget.on('viewportUpdated', this.onViewportChange)
    if (!this.viewportManager)
      this.viewportManager = createViewportManager(this.element, this.onViewportChange)
  }

  /**
   * Обработчик скролла
   */
  @autobind
  onViewportChange() {
    this.emit('viewportChange')
  }

  /**
   * Пересчитать размеры айфрейма
   */
  resize() {
    this.resizer.resize()
  }

  /**
   * Метод вызывается при удалении айфрейма
   */
  @autobind
  @once
  destroy() {
    removeFromDOM(this.element)
    this.emit('destroy')
    this.transport.destroy()
    this.removeAllListeners()
    if (this.viewportManager)
      this.viewportManager.destroy()
  }

}
