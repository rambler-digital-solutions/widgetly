import {IFrameProvider} from './iframe/provider'
import {EventEmitter, type ExternalizedEmitter} from './utils/event-emitter'
import {scrollByElementTo} from './utils/dom'
import type {Debounce, Callback} from './types'
import type {Mediator} from './mediator'
import type {Container, EnterViewportOptions} from './container'
import {BaseLayout} from './layouts/base-layout'

/**
 * Widget facade available to the user
 */
export interface ExternalizedWidget extends ExternalizedEmitter {
  params: Record<string, any>
  destroy(): void
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
  /** Unique widget name */
  name: string
  /** Widget initialization function, should render the widget */
  initialize(this: Widget): void
  /** Widget deletion function, this function should be called by the user when deleting the widget */
  destroy?(this: Widget): void
  /**
   * A factory that exports the facade available to the user.
   * By default, exports `properties` passed to the widget and properties that the iframe exports
   */
  externalize?(this: Widget): Record<string, any>
  /** A factory that exports the facade available in the iframe */
  externalizeAsProvider?(this: Widget): Record<string, any>
  /** Function to slow down the processing of Viewport changes, if it is absent, the standard debounce is used */
  reduceViewportChange?: Debounce
}

/**
 * Widget
 *
 * @event destroy Widget deletion event
 */
export class Widget extends EventEmitter {
  /** Widget identifier */
  public id: string

  /** Widget name */
  public name: string

  /** Widget configuration */
  private config: WidgetConfig

  /** Widget properties */
  private properties: Record<string, any>

  /** External parameters for the widget */
  private params: Record<string, any>

  private mediator: Mediator
  private layout?: BaseLayout
  private container?: Container
  private iframe?: IFrameProvider
  private destroyed = false

  /**
   * Creating a new widget instance
   *
   * @param mediator Mediator
   * @param id Widget identifier
   * @param config Widget configuration
   * @param properties Widget properties, this object is copied as is into the widget and supplements it with these properties
   * @param params Some external parameters for the widget.
   * You can specify an object with any properties, except for reserved ones (and properties starting with _):
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
   * - reduceViewportChange
   */
  // eslint-disable-next-line max-params
  public constructor(
    mediator: Mediator,
    id: string,
    config: WidgetConfig,
    properties: Record<string, any>,
    params: Record<string, any> = {}
  ) {
    super()
    this.mediator = mediator
    this.id = id
    this.config = config
    this.name = config.name
    this.properties = {}
    this.params = params

    for (const key in properties)
      if (properties.hasOwnProperty(key)) {
        const value = properties[key]

        this.properties[key] =
          typeof value === 'function' ? value.bind(this) : value

        if (this[key as keyof this] === undefined) {
          ;(this as any)[key] = this.properties[key]
        }
      }
  }

  /**
   * Widget initialization function
   */
  public async initialize() {
    await this.config.initialize.call(this)
    this.subscribeEvents()

    return this.externalize()
  }

  public updateViewport() {
    this.container?.updateViewport()
    this.iframe?.updateViewport()
  }

  /**
   * Destroy the widget and stop listening events
   */
  public destroy = () => {
    if (!this.destroyed) {
      this.destroyed = true
      this.unsubscribeEvents()
      this.layout?.destroy()
      this.iframe?.destroy()
      this.config.destroy?.call(this)
      this.emit('destroy')
      this.removeAllListeners()
    }
  }

  /**
   * Create an iframe
   *
   * @param url The URL where the iframe is located
   */
  public createIFrame(url: string) {
    return new IFrameProvider(
      url,
      this,
      this.id,
      this.config.reduceViewportChange
    )
  }

  /**
   * Set a container for the widget
   */
  public addToContainer(container: Container) {
    this.container = container
  }

  /**
   * A factory that exports the facade available to the external user
   */
  public externalize() {
    return {
      params: this.params,
      destroy: this.destroy.bind(this),
      ...this.externalizeEmitter(),
      ...(this.iframe?.consumer?.externalizedProps ?? {}),
      ...(this.config.externalize?.call(this) ?? this.properties)
    }
  }

  /**
   * A factory that exports the facade available in the iframe
   */
  public externalizeAsProvider() {
    return {
      url: location.href,
      mediator: this.mediator.externalizeAsProvider(),
      params: this.params,
      destroy: this.destroy.bind(this),
      subscribeVisibleAreaChange: this.subscribeVisibleAreaChange.bind(this),
      getVisibleArea: this.getIFrameVisibleArea.bind(this),
      scrollTo: this.iFrameScrollTo.bind(this),
      resize: this.iframe?.resize.bind(this.iframe),
      ...this.externalizeEmitter({withEmit: true}),
      ...(this.config.externalizeAsProvider?.call(this) ?? this.properties)
    }
  }

  /**
   * Wait when the container enters the viewport from the top
   */
  public async whenContainerInViewport(options: EnterViewportOptions) {
    await this.container?.whenEnterViewportFromTop(options)
  }

  /**
   * Scroll to a specific part of the iframe
   *
   * @param top The coordinate relative to the top-left corner of the iframe to scroll to
   * @param duration Scroll animation time, default is 200
   */
  private async iFrameScrollTo(top: number, duration = 200) {
    if (this.iframe) {
      await scrollByElementTo(this.iframe.getElement(), top, duration)
      this.iframe.updateViewport()
    }
  }

  /**
   * Callback for iframe viewport change (whether the iframe is visible or not)
   */
  private subscribeVisibleAreaChange(callback: Callback) {
    return this.iframe?.subscribeVisibleAreaChange(callback)
  }

  private subscribeEvents() {
    this.iframe?.on('destroy', this.destroy)
    this.layout?.on('destroy', this.destroy)
    this.container?.on('destroy', this.destroy)
  }

  private unsubscribeEvents() {
    this.iframe?.removeListener('destroy', this.destroy)
    this.layout?.removeListener('destroy', this.destroy)
    this.container?.removeListener('destroy', this.destroy)
  }

  private getIFrameVisibleArea() {
    return this.iframe?.getVisibleArea()
  }
}
