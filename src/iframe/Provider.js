import ContentElement from '../layouts/ContentElement'
import {Provider} from 'magic-transport'
import {parse as parseUrl} from 'url'
import {removeFromDOM, onRemoveFromDOM, createViewportManager} from '../utils/DOM'
import {once, mixin, autobind} from '../utils/decorators'
import {getVisibleArea} from '../utils/DOM/viewport'
import EventEmitter from '../utils/EventEmitter'

class Resizer {

  constructor(container, transport) {
    this.container = container
    this.transport = transport
  }

  async resize() {
    const size = await this.transport.consumer.getSize()
    this.setSize(size)
  }

  setSize({height}) {
    this.container.style.height = height + 'px'
  }

}

@mixin(EventEmitter.prototype)
export default class IFrameProvider extends ContentElement {

  /**
   * Обертка над iframe
   * @param {String} options.url - URL по которому нужно загрузить iframe
   * @param {Widget} options.widget - Объект виджета
   * @param {String} options.id - Уникальный идентификатор виджета
   *
   * @events
   * viewportChange - событие которое вызывается, когда вьюпорт элемента изменени
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
    this.transport = new Provider(this.id, this.consumerOrigin, {
      ...this.widget.externalizeAsProvider(),
      resize: () => this.resizer.resize(),
      setSize: (size) => this.resizer.setSize(size)
    })
    this.resizer = new Resizer(this.element, this.transport)
    this.provider = this.transport.provider
    this.consumer = await new Promise(resolve => this.transport.once('ready', resolve))
    await this.consumer.initialize()
    await this.resizer.resize()
    this.consumer.watchSize()

    return this.consumer
  }

  /**
   * Подписка на изменение видимой области iframe
   *
   */
  subscribeVisibleAreaChange(callback) {
    this._subscribeViewportChange()
    this.on('viewportChange', () => {
      callback(this.getVisibleArea())
    })
  }


  getVisibleArea() {
    return getVisibleArea(this.element)
  }


  @once
  _subscribeViewportChange() {
    if (!this.viewportManager)
      this.viewportManager = createViewportManager(this.element, this.updateViewport)
  }

  /**
   * Обработчик скролла
   */
  @autobind
  updateViewport() {
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
