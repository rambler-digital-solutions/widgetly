import {forOwn, isUndefined, isFunction} from 'lodash'
import {autobind, mixin} from 'core-decorators'
import IFrame from './iframe/Provider'
import EventEmitter from './utils/EventEmitter'
import {scrollByElementTo} from './utils/DOM'
import {once} from './utils/decorators'

/**
 * Класс виджета
 *
 * @property {EventEmitter} events - события
 * @event 'destroy' - событие кидается при удалении виджета
 */
@mixin(EventEmitter.prototype)
export default class Widget {

  /**
   * Параметры виджета
   * @type {Object}
   */
  params = {}

  /**
   * Идентификатор виджета
   * @type {Number}
   */
  id = null

  /**
   * Медиатор
   * @type {Mediator}
   */
  mediator = null

  /**
   * Конструктор
   * @param {Mediator} mediator - Медиатор
   * @param {String} id - Идентификатор виджета
   * @param {Object} config - Конфиг виджета
   * @param {String} config.name - Уникальное название виджета
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать виджет
   * @param {Function} [config.destroy] - Функция удаления виджета, эту функцию должен вызвать пользователь при удалнии виджета
   * @param {Function} [config.externalize] - Этот метод должен возвращать фасад с методами, которые будут доступны пользователю
   * @param {Function} [config.externalizeAsProvider] - Этот метод должен возвращать фасад с методами, которые будут доступны айфрейму
   * @param {Object} properties - Свойства виджета, этот объект копируется как есть в виджет(this) и дополняет его этими свойствами
   * @param {Object} params - Некоторые внешние параметры для виджета
   * Можно указать объект с любыми свойствами, за исключением зарезервированных (и свойств начинающихся на _):
   * - mediator
   * - id
   * - config
   * - name
   * - properties
   * - params
   * - initialize
   * - updateViewport
   * - destroy
   * - createIFrame
   * - externalize
   * - externalizeAsProvider
   * - whenContainerInViewport
   */
  constructor(mediator, id, config, properties, params) {
    EventEmitter.call(this)
    this.mediator = mediator
    this.id = id
    this.config = config
    this.name = config.name
    this.properties = {}
    this.params = params
    this._destroyed = false

    if (config.externalize)
      this.externalize = config.externalize.bind(this)

    forOwn(properties, (value, key) => {
      this.properties[key] = isFunction(value) ? value.bind(this) : value
      if (isUndefined(this[key]))
        this[key] = this.properties[key]
    })
  }

  initialize() {
    const {initialize} = this.config
    return Promise.resolve(initialize.call(this)).then(() => {
      this._subscribeEvents()
      return this.externalize()
    })
  }

  updateViewport() {
    if (this.container)
      this.container.updateViewport()
    this.emit('viewportUpdated')
  }

  @autobind
  @once
  destroy() {
    this._unsubscribeEvents()
    if (this.layout)
      this.layout.destroy()
    if (this.iframe)
      this.iframe.destroy()
    if (this.config.destroy)
      this.config.destroy.call(this)
    this.emit('destroy')
    this.removeAllListeners()
  }

  /**
   * Создаем айфрейм
   * @param {String} url - Адрес, где расположен iframe
   */
  createIFrame(url) {
    return new IFrame(url, this, this.id)
  }

  /**
   * Экспортирование свойств, которые будут доступны внешнему пользователю
   */
  externalize() {
    return {
      ...this.properties,
      ...(this.iframe ? this.iframe.consumer.externalizedProps : {}),
      ...this.externalizeEmitter(),
      destroy: ::this.destroy,
      params: this.params
    }
  }

  /**
   * Экспортирование свойств, которые будут доступны в iframe
   */
  externalizeAsProvider() {
    const {externalizeAsProvider} = this.config
    return {
      url: location.href,
      mediator: this.mediator.externalizeAsProvider(),
      destroy: ::this.destroy,
      params: this.params,
      subscribeVisibleAreaChange: ::this._subscribeVisibleAreaChange,
      getVisibleArea: ::this._getIFrameVisibleArea,
      scrollTo: ::this._iFrameScrollTo,
      resize: ::this.iframe.resize,
      ...this.externalizeEmitter({withEmit: true}),
      ...(externalizeAsProvider ? externalizeAsProvider.call(this) : this.properties)
    }
  }

  whenContainerInViewport(...args) {
    return !this.container ? Promise.resolve() : this.container.whenEnterViewportFromTop(...args)
  }

  /**
   * Подскроллить к определенной части айфрейма
   * @param {Number} top - координата относительно верхнего левого угла айфрейма, к которой нужно подскроллить
   * @param {Number} duration = 200 - время анимации скролла
   */
  async _iFrameScrollTo(top, duration) {
    await scrollByElementTo(this.iframe.getElement(), top, duration)
    this.iframe.onViewportChange()
  }

  /**
   * Колбек изменения вьюпорта айфрема (айфрем виден или нет)
   * @return {[type]} [description]
   */
  _subscribeVisibleAreaChange(offset, callback) {
    if (this.iframe)
      this.iframe.subscribeVisibleAreaChange(offset, callback)
  }

  _subscribeEvents() {
    if (this.iframe)
      this.iframe.on('destroy', this.destroy)
    if (this.layout)
      this.iframe.on('destroy', this.destroy)
    if (this.container)
      this.container.on('destroy', this.destroy)
  }

  _unsubscribeEvents() {
    if (this.iframe)
      this.iframe.removeListener('destroy', this.destroy)
    if (this.layout)
      this.layout.removeListener('destroy', this.destroy)
    if (this.container)
      this.container.removeListener('destroy', this.destroy)
  }

  _getIFrameVisibleArea() {
    return this.iframe.getVisibleArea()
  }

}
