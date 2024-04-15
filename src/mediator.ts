import domready from 'domready'
import {randomId} from './utils/random-id'
import {mutationEvents} from './utils/dom'
import {EventEmitter} from './utils/event-emitter'
import {Container} from './container'
import {Widget, type WidgetConfig, type ExternalizedWidget} from './widget'

/**
 * Конфигурация медиатора
 */
export interface MediatorConfig {
  /** Префикс для data-атрибутов */
  prefix: string
  /** Функция инициализации */
  initialize(): void
  /** Фабрика, которая экспортирует фасад, доступный в iframe */
  externalizeAsProvider?(this: Mediator): Record<string, any>
}

/**
 * Медиатор - фабрика виджетов
 */
export class Mediator extends EventEmitter {
  public static provideId() {
    return randomId()
  }

  /**
   * Счетчик widgetId
   */
  private counterWidgetId = 0

  /**
   * Виджеты
   */
  public widgets: Record<
    string,
    {config: WidgetConfig; properties: Record<string, any>}
  > = {}

  /**
   * Инстанции виджетов
   */
  public widgetInstances: Record<string, Widget> = {}

  public id: string
  public prefix: string
  private config: MediatorConfig
  private properties: Record<string, any>

  /**
   * Создание новой инстанции медиатора
   *
   * @param config Конфиг виджета
   * @param properties Дополнительные свойства/методы для медиатора
   * Можно указать объект с любыми свойствами, за исключением зарезервированных (и свойств начинающихся на _):
   * - config
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
  public constructor(
    config: MediatorConfig,
    properties: Record<string, any> = {}
  ) {
    super()
    this.config = config
    this.prefix = config.prefix
    this.id = Mediator.provideId()
    this.properties = {}

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const value = properties[key]

        if (this[key as keyof this] === undefined) {
          ;(this as any)[key] = value
        }

        this.properties[key] =
          typeof value === 'function' ? value.bind(this) : value
      }
    }

    this.config.initialize?.call(this)
    mutationEvents.on('mutation', this.initializeDOMElements)
    domready(this.initializeDOMElements)
  }

  public destroy() {
    mutationEvents.removeListener('mutation', this.initializeDOMElements)
  }

  /**
   * Получить айдишник для виджета
   */
  private provideWidgetId() {
    const prefix = this.prefix ? `${this.prefix}_` : ''

    return `${prefix}${this.id}_${++this.counterWidgetId}`
  }

  /**
   * Определяем виджет
   *
   * @param config Конфиг виджета
   * @param properties Дополнительные свойства виджета, этот объект копируется в виджет как есть и дополняет его этими свойствами
   */
  public defineWidget(
    config: WidgetConfig,
    properties: Record<string, any> = {}
  ) {
    if (this.widgets[config.name]) {
      throw new Error(`Widget with name '${config.name}' already exists`)
    }

    this.widgets[config.name] = {
      config,
      properties
    }
  }

  /**
   * Создание виджета и установка его на страницу
   *
   * @param name Название виджета
   * @param containerElement Элемент/селектор, в которой будет вставлен виджет
   * @param params Параметры инициализации виджета
   */
  public buildWidget(
    name: string,
    containerElement: HTMLElement | string,
    params?: Record<string, any>
  ): Promise<ExternalizedWidget>

  /**
   * Создание виджета и установка его на страницу
   *
   * @param name Название виджета
   * @param params Параметры инициализации виджета
   */
  public buildWidget(
    name: string,
    params?: Record<string, any>
  ): Promise<ExternalizedWidget>

  public buildWidget(
    name: string,
    containerElement?: HTMLElement | string | Record<string, any>,
    params?: Record<string, any>
  ): Promise<ExternalizedWidget> {
    if (!this.widgets[name]) {
      throw new Error(`Widget '${name}' does not exists`)
    }

    let resultElement
    let resultParams

    if (
      !params &&
      typeof containerElement !== 'string' &&
      !(containerElement instanceof HTMLElement)
    ) {
      resultParams = containerElement
      resultElement = undefined
    } else {
      resultParams = params
      resultElement = containerElement
    }

    if (typeof resultElement === 'string') {
      resultElement = document.querySelector(resultElement) as HTMLElement
    }

    const {config, properties} = this.widgets[name]
    const id = this.provideWidgetId()
    const widget = (this.widgetInstances[id] = new Widget(
      this,
      id,
      config,
      properties,
      resultParams
    ))

    widget.once('destroy', () => delete this.widgetInstances[id])

    if (resultElement) {
      const container = new Container(
        resultElement as HTMLElement,
        config.reduceViewportChange
      )

      widget.addToContainer(container)
      container.getElement().rcWidget = widget
    }

    return widget.initialize()
  }

  public updateViewport = () => {
    const widgets = this.widgetInstances

    for (const key in widgets) {
      if (widgets.hasOwnProperty(key)) {
        widgets[key].updateViewport()
      }
    }
  }

  /**
   * Инициализация DOM-элементов
   */
  private initializeDOMElements = () => {
    const prefix = this.prefix ? `${this.prefix}-` : ''
    const elements = [].slice.call(
      document.querySelectorAll(
        `[data-${prefix}widget]:not([data-${prefix}inited])`
      )
    ) as HTMLElement[]

    elements.forEach((element) => {
      if (element.hasAttribute(`data-${prefix}inited`)) {
        return
      }

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

      element.setAttribute(`data-${prefix}inited`, 'true')
      this.buildWidget(widget as string, element, params)
    })
  }

  /**
   * Фабрика, которая экспортирует фасад, доступный виджету
   */
  public externalize() {
    return {
      buildWidget: this.buildWidget.bind(this),
      initializeDOMElements: this.initializeDOMElements.bind(this),
      ...this.externalizeEmitter(),
      ...this.properties
    }
  }

  /**
   * Фабрика, которая экспортирует фасад, доступный внутри iframe
   */
  public externalizeAsProvider() {
    return {
      buildWidget: this.buildWidget.bind(this),
      initializeDOMElements: this.initializeDOMElements.bind(this),
      ...this.externalizeEmitter(),
      ...(this.config.externalizeAsProvider?.call(this) ?? this.properties)
    }
  }
}

export function createMediator(
  config: MediatorConfig,
  properties?: Record<string, any>
) {
  return new Mediator(config, properties)
}
