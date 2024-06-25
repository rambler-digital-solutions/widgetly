import domready from 'domready'
import {randomId} from './utils/random-id'
import {mutationEvents} from './utils/dom'
import {EventEmitter, type EventEmitterAPI} from './utils/event-emitter'
import {Container} from './container'
import {Widget, type WidgetConfig, type WidgetAPI} from './widget'

/**
 * Mediator configuration
 */
export interface MediatorConfig {
  /** Prefix for data-attributes */
  prefix: string
  /** Initialization function */
  initialize?(this: Mediator): void
  /** Factory that exports a facade available in an iframe */
  externalizeAsProvider?(this: Mediator): Record<string, any>
}

/**
 * Mediator facade available to the widget and inside an iframe
 */
export interface MediatorAPI extends EventEmitterAPI, Record<string, any> {
  buildWidget(
    name: string,
    containerElement: HTMLElement | string,
    params?: Record<string, any>
  ): Promise<WidgetAPI>
  buildWidget(name: string, params?: Record<string, any>): Promise<WidgetAPI>
  initializeDOMElements(): void
}

/**
 * Mediator - a widget factory
 */
export class Mediator extends EventEmitter {
  public static provideId() {
    return randomId()
  }

  /**
   * Widget identifier counter
   */
  private counterWidgetId = 0

  /**
   * Widgets
   */
  public widgets: Record<
    string,
    {config: WidgetConfig; properties: Record<string, any>}
  > = {}

  /**
   * Widget instances
   */
  public widgetInstances: Record<string, Widget> = {}

  /**
   * Mediator identifier
   */
  public id: string

  /**
   * Prefix used for data-attributes
   */
  public prefix: string

  private config: MediatorConfig
  private properties: Record<string, any>

  /**
   * Creating a new instance of the mediator
   *
   * @param config Widget configuration
   * @param properties Additional properties/methods for the mediator
   * You can specify an object with any properties, except for reserved ones (and properties starting with _):
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

  /**
   * Destroy the mediator and stop listening to DOM events
   */
  public destroy() {
    mutationEvents.removeListener('mutation', this.initializeDOMElements)
  }

  /**
   * Get widget identifier
   */
  private provideWidgetId() {
    const prefix = this.prefix ? `${this.prefix}_` : ''

    return `${prefix}${this.id}_${++this.counterWidgetId}`
  }

  /**
   * Define a widget
   *
   * @param config Widget configuration
   * @param properties Additional widget properties, this object is copied to the widget as is and supplements it with these properties
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
   * Create a widget and place it on the page
   *
   * @param name Widget name
   * @param containerElement Element/selector where the widget will be inserted
   * @param params Widget initialization parameters
   */
  public buildWidget(
    name: string,
    containerElement: HTMLElement | string,
    params?: Record<string, any>
  ): Promise<WidgetAPI>

  /**
   * Create a widget and place it on the page
   *
   * @param name Widget name
   * @param params Widget initialization parameters
   */
  public buildWidget(
    name: string,
    params?: Record<string, any>
  ): Promise<WidgetAPI>

  public buildWidget(
    name: string,
    containerElement?: HTMLElement | string | Record<string, any>,
    params?: Record<string, any>
  ): Promise<WidgetAPI> {
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
   * Initialization of DOM elements
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

        // removing prefix
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
   * Factory that exports a facade available to the widget
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
   * Factory that exports a facade available inside an iframe
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

/**
 * Creating a mediator
 *
 * @param config Configuration
 * @param properties Additional properties
 */
export function createMediator(
  config: MediatorConfig,
  properties?: Record<string, any>
) {
  return new Mediator(config, properties)
}
