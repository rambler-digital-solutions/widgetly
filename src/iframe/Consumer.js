import {Consumer} from 'magic-transport'
import {parse as parseUrl} from 'url'
import forOwn from 'lodash/forOwn'
import isUndefined from 'lodash/isUndefined'
import isFunction from 'lodash/isFunction'

class IFrameResizer {

  constructor(options) {
    window.iFrameResizer = options
    /* eslint-disable global-require */
    require('iframe-resizer/js/iframeResizer.contentWindow')
    /* eslint-enable global-require */
    this.parent = window.parentIFrame
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
      initialize: () => (
        Promise.resolve(this.config.initialize.call(this, this.provider)).then(() =>
          new Promise((resolve) => {
            this.resizer = new IFrameResizer({
              targetOrigin: '*',
              readyCallback: () => (
                resolve()
              )
            })
          })
        )
      ),
      externalizedProps: this.externalize()
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
