import {IFrameProvider} from './iframe/provider'
import {EventEmitter} from './utils/event-emitter'
import {scrollByElementTo} from './utils/dom'
import type {Debounce, Callback} from './types'
import type {Mediator} from './mediator'
import type {Container, EnterViewportOptions} from './container'
import {BaseLayout} from './layouts/base-layout'

/**
 * Конфигурация виджета
 */
export interface WidgetConfig {
  /** Уникальное название виджета */
  name: string
  /** Функция инициализации виджета. Должна отрисовывать виджет */
  initialize(this: Widget): void
  /** Функция удаления виджета, эту функцию должен вызвать пользователь при удалнии виджета */
  destroy?(this: Widget): void
  /** Фабрика, которая экспортирует фасад, доступный пользователю */
  externalize?(this: Widget): Record<string, any>
  /** Фабрика, которая экспортирует фасад, доступный в iframe */
  externalizeAsProvider?(this: Widget): Record<string, any>
  /** Функция для замедления обработки изменений Viewport, если он отсутствует, используется стандартный debounce */
  reduceViewportChange?: Debounce
}

/**
 * Виджет
 *
 * @event destroy Событие удаления виджета
 */
export class Widget extends EventEmitter {
  /** Идентификатор виджета */
  public id: string

  /** Название виджета */
  public name: string

  /** Конфигурация виджета */
  private config: WidgetConfig

  /** Свойства виджета */
  private properties: Record<string, any>

  /** Внешние параметры для виджета */
  private params: Record<string, any>

  private mediator: Mediator
  private layout?: BaseLayout
  private container?: Container
  private iframe?: IFrameProvider
  private destroyed = false

  /**
   * Создание новой инстанции виджета
   *
   * @param mediator Медиатор
   * @param id Идентификатор виджета
   * @param config Конфигурация виджета
   * @param properties Свойства виджета, этот объект копируется как есть в виджет и дополняет его этими свойствами
   * @param params Некоторые внешние параметры для виджета.
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

  public async initialize() {
    await this.config.initialize.call(this)
    this.subscribeEvents()

    return this.externalize()
  }

  public updateViewport() {
    this.container?.updateViewport()
    this.iframe?.updateViewport()
  }

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
   * Создаем айфрейм
   *
   * @param url Адрес, где расположен iframe
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
   * Установка контейнера для виджета
   */
  public addToContainer(container: Container) {
    this.container = container
  }

  /**
   * Фабрика, которая экспортирует фасад, доступный внешнему пользователю
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
   * Фабрика, которая экспортирует фасад, доступный в iframe
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
   * Ожидание момента, когда контейнер входит во вьюпорт сверху
   */
  public async whenContainerInViewport(options: EnterViewportOptions) {
    await this.container?.whenEnterViewportFromTop(options)
  }

  /**
   * Подскроллить к определенной части айфрейма
   *
   * @param top Координата относительно верхнего левого угла айфрейма, к которой нужно подскроллить
   * @param duration Время анимации скролла, по-умолчанию 200
   */
  private async iFrameScrollTo(top: number, duration = 200) {
    if (this.iframe) {
      await scrollByElementTo(this.iframe.getElement(), top, duration)
      this.iframe.updateViewport()
    }
  }

  /**
   * Колбек изменения вьюпорта айфрема (айфрем виден или нет)
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
