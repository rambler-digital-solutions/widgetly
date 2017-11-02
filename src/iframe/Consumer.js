import {Consumer} from 'magic-transport'
import {parse as parseUrl} from 'url'
import forOwn from 'lodash/forOwn'
import isUndefined from 'lodash/isUndefined'
import isFunction from 'lodash/isFunction'
import isEqual from 'lodash/isEqual'
import throttle from 'lodash/throttle'
import {mutationEvents, setMutationParams} from '../utils/DOM'
import EventEmitter from '../utils/EventEmitter'

setMutationParams({
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
})

class IFrameResizer {

  constructor(transport) {
    this.events = new EventEmitter
    this.transport = transport
    this.resize = throttle(::this.resize, 60, {
      leading: true,
      trailing: true
    })
  }

  getSize() {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  }

  resize() {
    const newSize = this.getSize()
    if (!isEqual(newSize, this.currentSize)) {
      this.transport.provider.setSize(newSize)
      this.currentSize = newSize
      this.events.emit('resize', this.currentSize)
    }
  }

  watchSize() {
    mutationEvents.on('mutation', this.resize)
  }

}

export default class IFrameConsumer {

  /**
   * Этот файл должен вызываться из айфрейма
   * @param {Object} config Конфиг
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать приложение
   * @param {Function} [config.externalizeAsConsumer] - Этот метод должен возвращать фасад с методами, которые будут доступны виджету
   * @param {Function} [config.externalize] - Этот метод должен возвращать фасад с методами, которые видны снаружи виджета (вебмастеру)
   * @param {Object} properties Общие свойства
   *
   * Имеет следуюшие свойства
   * @property origin - origin окна, которое загрузило текущий iframe
   */
  constructor(config, properties = {}) {
    this.id = this.parseId()
    this.config = config
    this.properties = {}
    this.provider = null

    forOwn(properties, (value, key) => {
      this.properties[key] = isFunction(value) ? value.bind(this) : value
      if (isUndefined(this[key]))
        this[key] = this.properties[key]
    })

    this.transport = new Consumer(this.id, '*', this.externalizeAsConsumer())
    this.resizer = new IFrameResizer(this.transport)
    this.consumer = this.transport.consumer
    this.transport.once('ready', () => {
      this.provider = this.transport.provider
      this.parentUrl = this.provider.url
      const {protocol, host} = parseUrl(this.parentUrl)
      this.parentOrigin = `${protocol}//${host}`
    })
  }

  parseId() {
    return parseUrl('?' + window.location.hash.slice(1), true).query.widgetId
  }

  externalizeAsConsumer() {
    return {
      ...(this.config.externalizeAsConsumer ? this.config.externalizeAsConsumer.call(this) : this.properties),
      // Эту функцию должен вызывать provider для инициализации
      initialize: () => this.config.initialize.call(this, this.provider),
      externalizedProps: this.externalize(),
      getSize: () => this.resizer.getSize(),
      watchSize: () => this.resizer.watchSize(),
      resize: (params) => {
        this.resizer.resize(params)
      }
    }
  }

  /**
   * Этот метод возвращает внешние свойства, доступные вебмастеру
   * @return {Object}
   */
  externalize() {
    if (this.config.externalize)
      return this.config.externalize.call(this)
    return this.properties
  }

}

/**
 * Регистрация айфрейма
 */
export function registerIFrame(...args) {
  return new IFrameConsumer(...args)
}
