import ContentElement from '../layouts/ContentElement'
import {Provider} from 'magic-transport'
import {
  removeFromDOM,
  onRemoveFromDOM,
  createViewportManager
} from '../utils/DOM'
import {once, mixin, autobind} from '../utils/decorators'
import {getVisibleArea} from '../utils/DOM/viewport'
import EventEmitter from '../utils/EventEmitter'

class Resizer {
  constructor(container, transport) {
    this.container = container
    this.transport = transport
  }

  resize() {
    return this.transport.consumer.getSize().then(size => {
      this.setSize(size)
    })
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
    this.url =
      url + (url.indexOf('#') === -1 ? '#' : '&') + 'widgetId=' + this.id
    this.widget = widget

    this._destroyed = false

    const {protocol, host} = new URL(url)
    if (host) this.consumerOrigin = `${protocol}//${host}`
    else this.consumerOrigin = location.origin
    this.createElement()
  }

  createElement() {
    this.element = document.createElement('iframe')
    this.element.style.display = 'block !important'
    this.element.setAttribute('frameborder', 'no')
    this.element.setAttribute('width', '100%')
    this.element.setAttribute('scrolling', 'no')
    this.element.name = this.id
    this.element.id = this.id
    this.element.src = this.url
    onRemoveFromDOM(this.element, this.destroy)
  }

  initialize() {
    this.transport = new Provider(this.id, this.consumerOrigin, {
      ...this.widget.externalizeAsProvider(),
      resize: () => this.resizer.resize(),
      setSize: size => this.resizer.setSize(size)
    })
    this.resizer = new Resizer(this.element, this.transport)
    this.provider = this.transport.provider
    return new Promise(resolve => this.transport.once('ready', resolve))
      .then(consumer => {
        this.consumer = consumer
      })
      .then(() => this.consumer.initialize())
      .then(() => this.resizer.resize())
      .then(() => {
        this.consumer.watchSize()
        return this.consumer
      })
  }

  /**
   * Подписка на изменение видимой области iframe
   * @param {Function}  callback
   * @return {Function} Функция отписки от события
   */
  subscribeVisibleAreaChange(callback) {
    this._subscribeViewportChange()
    const withCallback = () => {
      callback(this.getVisibleArea())
    }
    this.on('viewportChange', withCallback)
    const unsubscribeVisibleAreaChange = () => {
      this.removeListener('viewportChange', withCallback)
    }
    return unsubscribeVisibleAreaChange
  }

  getVisibleArea() {
    return getVisibleArea(this.element)
  }

  @once
  _subscribeViewportChange() {
    if (!this.viewportManager)
      this.viewportManager = createViewportManager(
        this.element,
        this.updateViewport
      )
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
    if (this.viewportManager) this.viewportManager.destroy()
  }
}
