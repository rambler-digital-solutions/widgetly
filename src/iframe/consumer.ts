import {Consumer} from 'magic-transport'
import {IFrameResizer} from './consumer-resizer'

/**
 * Конфигурация консъюмера внутри iframe
 */
export interface IFrameConsumerConfig {
  /** Функция инициализации виджета, должна отрисовывать приложение */
  initialize(): void
  /** Фабрика, которая экспортирует фасад, доступный снаружи виджета пользователю */
  externalize?(): void
  /** Фабрика, которая экспортирует фасад, доступный виджету */
  externalizeAsConsumer?(): void
}

class IFrameConsumer {
  public id: string
  public resizer: IFrameResizer
  public transport: Consumer<any, any>
  public consumer: Record<string, any>
  public provider?: Record<string, any>

  private config: IFrameConsumerConfig
  private properties: Record<string, any>
  private parentUrl?: string
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private parentOrigin?: string

  /**
   * Конструктор
   *
   * @param config Конфиг
   * @param properties Общие свойства
   */
  public constructor(
    config: IFrameConsumerConfig,
    properties: Record<string, any>
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

    this.transport = new Consumer({
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
   * Фабрика, которая экспортирует фасад, доступный снаружи виджета (вебмастеру)
   */
  externalize() {
    return this.config.externalize?.call(this) ?? this.properties
  }

  /**
   * Фабрика, которая экспортирует фасад, доступный виджету
   */
  externalizeAsConsumer() {
    return {
      // Эту функцию должен вызывать provider для инициализации
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
 * Регистрация айфрейма
 *
 * @param config Конфиг
 * @param properties Общие свойства
 */
export function registerIFrame(
  config: IFrameConsumerConfig,
  properties: Record<string, any>
) {
  return new IFrameConsumer(config, properties)
}
