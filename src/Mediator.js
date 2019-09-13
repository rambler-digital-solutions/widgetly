import domready from 'domready'
import randomId from './utils/randomId'
import {mixin, autobind} from './utils/decorators'
import {mutationEvents} from './utils/DOM'
import EventEmitter from './utils/EventEmitter'
import Container from './Container'
import Widget from './Widget'

/**
 * @class Mediator - класс медиатора
 */
@mixin(EventEmitter.prototype)
export default class Mediator {
  static provideId() {
    return randomId()
  }

  /**
   * Генерация widgetId
   * @type {Number}
   */
  counterWidgetId = 0

  /**
   * Виджеты
   * @type {Object}
   */
  widgets = {}

  /**
   * Инстанции виджетов
   * @type {Object}
   */
  widgetInstances = {}

  /**
   * Медиатор
   * @param {Object} options - Конфиг виджета
   * @param {String} options.prefix - Префикс для data-атрибутов
   * @param {Function} options.initialize - Функция инициализации
   * @param {Object} [properties] - Дополнительные свойства/методы для медиатора
   * Можно указать объект с любыми свойствами, за исключением зарезервированных (и свойств начинающихся на _):
   * - options
   * - prefix
   * - id
   * - properties
   * - initializeDOMElements
   * - counterWidgetId
   * - widgets
   * - widgetInstances
   * - destroy
   * - provideWidgetId
   * - defineWidget
   * - buildWidget
   * - updateViewport
   * - initializeDOMElements
   * - externalize
   * - externalizeAsProvider
   */
  constructor(options = {}, properties = {}) {
    EventEmitter.call(this)
    this.options = options
    this.prefix = options.prefix
    this.config = options.config || {}
    this.id = Mediator.provideId()
    this.properties = {}
    for (const key in properties)
      if (properties.hasOwnProperty(key)) {
        const value = properties[key]
        if (this[key] === undefined) this[key] = value
        this.properties[key] =
          typeof value === 'function' ? value.bind(this) : value
      }
    if (this.options.initialize) this.options.initialize.call(this)
    mutationEvents.on('mutation', this.initializeDOMElements)
    domready(this.initializeDOMElements)
  }

  destroy() {
    mutationEvents.removeListener('mutation', this.initializeDOMElements)
  }

  /**
   * Получить айдишник для виджета
   */
  provideWidgetId() {
    const prefix = this.prefix ? `${this.prefix}_` : ''
    return `${prefix}${this.id}_${++this.counterWidgetId}`
  }

  /**
   * Определяем виджет
   * @param {Object} config - Конфиг виджета
   * @param {String} config.name - Уникальное название виджета
   * @param {Function} config.initialize - Функция инициализации виджета. Должна отрисовывать виджет
   * @param {Function} config.destroy - Функция удаления виджета, эту функцию должен вызвать пользователь при удалнии виджета
   * @param {Function} config.externalize - Этот метод должен возвращать фасад с методами, которые будут доступны пользователю
   * @param {Function} [config.externalizeAsProvider] - Этот метод должен возвращать фасад с методами, которые будут доступны айфрейму
   * @param {Object} properties - Свойства виджета, этот объект копируется как есть в виджет(this) и дополняет его этими свойствами
   */
  defineWidget(config = {}, properties = {}) {
    if (this.widgets[config.name])
      throw new Error(`Widget with name '${config.name}' already exists`)
    this.widgets[config.name] = {
      config,
      properties
    }
  }

  /**
   * Создание виджета и установка его на страницу
   * @param {String} name - Название виджета
   * @param {HTMLElement|String} - Элемент/селектор, в которой будет вставлен виджет
   * @param {Object} params - Параметры инициализации виджета
   * @return {Promise}
   */
  buildWidget(name, containerElement, params) {
    if (!this.widgets[name]) throw new Error(`Widget '${name}' does not exists`)
    if (
      !params &&
      typeof containerElement !== 'string' &&
      !(containerElement instanceof HTMLElement)
    ) {
      params = containerElement
      containerElement = null
    }
    if (typeof containerElement === 'string')
      containerElement = document.querySelector(containerElement)
    const {config, properties} = this.widgets[name]
    const id = this.provideWidgetId()
    const widget = (this.widgetInstances[id] = new Widget(
      this,
      id,
      config,
      properties,
      params
    ))
    widget.once('destroy', () => delete this.widgetInstances[id])
    widget.container = containerElement ? new Container(containerElement) : null
    if (containerElement) containerElement.rcWidget = widget
    return widget.initialize()
  }

  @autobind
  updateViewport() {
    const widgets = this.widgetInstances
    for (const key in widgets)
      if (widgets.hasOwnProperty(key)) widgets[key].updateViewport()
  }

  /**
   * Инициализация DOM-элементов
   */
  @autobind
  initializeDOMElements() {
    const prefix = this.prefix ? `${this.prefix}-` : ''
    const elements = [].slice.call(
      document.querySelectorAll(
        `[data-${prefix}widget]:not([data-${prefix}inited])`
      )
    )
    elements.forEach(element => {
      const {...dataset} = element.dataset
      if (this.prefix) {
        const prefixLen = this.prefix.length
        // убираем префикс
        for (const key in dataset)
          if (dataset.hasOwnProperty(key)) {
            const newKey =
              key.slice(prefixLen, prefixLen + 1).toLowerCase() +
              key.slice(prefixLen + 1)
            dataset[newKey] = dataset[key]
            delete dataset[key]
          }
      }
      const {widget, ...params} = dataset
      element.setAttribute(`data-${prefix}inited`, true)
      this.buildWidget(widget, element, params)
    })
  }

  externalize() {
    return {
      buildWidget: ::this.buildWidget,
      initializeDOMElements: ::this.initializeDOMElements,
      ...this.properties,
      ...this.externalizeEmitter()
    }
  }

  externalizeAsProvider() {
    const {externalizeAsProvider} = this.options
    return {
      buildWidget: ::this.buildWidget,
      initializeDOMElements: ::this.initializeDOMElements,
      ...this.externalizeEmitter(),
      ...(externalizeAsProvider
        ? externalizeAsProvider.call(this)
        : this.properties)
    }
  }
}
