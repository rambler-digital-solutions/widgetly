import type BaseEventEmitter from 'events'
import {Consumer} from 'magic-transport'
import type {Size, Promisify} from '../types'
import type {IFrameProviderAPI} from './provider'
import {IFrameResizer} from './consumer-resizer'

/**
 * Configuration of the consumer inside an iframe
 */
export interface IFrameConsumerConfig {
  /** Widget initialization function, should render the application */
  initialize(this: IFrameConsumer): void
  /** Factory that exports a facade available externally to the widget user */
  externalize?(this: IFrameConsumer): void
  /** Factory that exports a facade available to the widget */
  externalizeAsConsumer?(this: IFrameConsumer): void
}

/**
 * Consumer facade available to the widget
 */
export interface IFrameConsumerAPI extends Record<string, any> {
  initialize(this: IFrameConsumer): void
  externalizedProps: Record<string, any>
  getSize(): Size
  watchSize(): void
  resize(): void
}

/**
 * Consumer inside an iframe
 */
export class IFrameConsumer {
  public id: string
  public resizer: IFrameResizer
  public transport: Consumer<IFrameProviderAPI, IFrameConsumerAPI>
  public consumer: BaseEventEmitter & IFrameConsumerAPI
  public provider!: Promisify<BaseEventEmitter & IFrameProviderAPI>

  private config: IFrameConsumerConfig
  private properties: Record<string, any>
  private parentUrl?: string
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private parentOrigin?: string

  /**
   * Constructor
   *
   * @param config Configuration
   * @param properties Additional properties
   */
  public constructor(
    config: IFrameConsumerConfig,
    properties?: Record<string, any>
  ) {
    this.id = this.parseId()
    this.config = config
    this.properties = {}

    for (const key in properties)
      if (properties.hasOwnProperty(key)) {
        const value = properties[key]

        this.properties[key] =
          typeof value === 'function' ? value.bind(this) : value

        if (this[key as keyof this] === undefined) {
          this[key as keyof this] = this.properties[key]
        }
      }

    this.transport = new Consumer<IFrameProviderAPI, IFrameConsumerAPI>({
      id: this.id,
      parentOrigin: '*',
      ...this.externalizeAsConsumer()
    })
    this.resizer = new IFrameResizer(this.transport)
    this.consumer = this.transport.consumer
    this.transport.once('ready', () => {
      this.provider = this.transport.provider
      this.parentUrl = this.provider?.url as string

      const {protocol, host} = new URL(this.parentUrl)

      this.parentOrigin = `${protocol}//${host}`
    })
  }

  parseId() {
    return new URLSearchParams(window.location.hash.slice(1)).get(
      'widgetId'
    ) as string
  }

  /**
   * Factory that exports a facade available externally to the widget (for the webmaster)
   */
  externalize() {
    return this.config.externalize?.call(this) ?? this.properties
  }

  /**
   * Factory that exports a facade available to the widget
   */
  externalizeAsConsumer() {
    return {
      // This function should be called by the provider for initialization
      initialize: this.config.initialize.bind(this),
      externalizedProps: this.externalize(),
      getSize: () => this.resizer.getSize(),
      watchSize: () => this.resizer.watchSize(),
      resize: () => this.resizer.resize(),
      ...(this.config.externalizeAsConsumer?.call(this) ?? this.properties)
    }
  }
}

/**
 * Iframe registration
 *
 * @param config Configuration
 * @param properties Additional properties
 */
export function registerIFrame(
  config: IFrameConsumerConfig,
  properties?: Record<string, any>
) {
  return new IFrameConsumer(config, properties)
}
