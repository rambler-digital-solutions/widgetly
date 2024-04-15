import {Provider} from 'magic-transport'
import {
  removeFromDOM,
  onRemoveFromDOM,
  createViewportManager,
  type ViewportManager
} from '../utils/dom'
import {getVisibleArea, type VisibleArea} from '../utils/dom/viewport'
import {EventEmitter} from '../utils/event-emitter'
import type {Callback, Debounce, Size} from '../types'
import type {Widget} from '../widget'
import {Resizer} from './provider-resizer'

/**
 * Обертка над iframe
 *
 * @event viewportChange Событие изменение вьюпорта элемента
 * @event destroy Завершение работы провайдера
 */
export class IFrameProvider extends EventEmitter {
  public id: string
  public url: string
  public resizer?: Resizer
  public transport?: Provider<any, any>
  public consumer?: Record<string, any>
  public provider?: Record<string, any>

  private element!: HTMLIFrameElement
  private widget: Widget
  private viewportManager?: ViewportManager
  private consumerOrigin: string
  private reduceViewportChange?: Debounce
  private destroyed = false

  /**
   * Создание новой инстанции провайдера
   *
   * @param url URL по которому нужно загрузить iframe
   * @param widget Объект виджета
   * @param id Уникальный идентификатор виджета
   * @param reduceViewportChange Метод создания замедления отслеживания изменения Viewport
   */
  // eslint-disable-next-line max-params
  public constructor(
    url: string,
    widget: Widget,
    id: string,
    reduceViewportChange?: Debounce
  ) {
    super()
    this.id = id
    this.url = `${url}${!url.includes('#') ? '#' : '&'}widgetId=${this.id}`
    this.widget = widget
    this.reduceViewportChange = reduceViewportChange

    const {protocol, host} = new URL(url)

    this.consumerOrigin = host ? `${protocol}//${host}` : location.origin
    this.createElement()
  }

  public getElement() {
    return this.element
  }

  public createElement() {
    this.element = document.createElement('iframe')
    this.element.style.display = 'block !important'
    this.element.setAttribute('frameborder', 'no')
    this.element.setAttribute('width', '100%')
    this.element.setAttribute('scrolling', 'no')
    this.element.name = this.id
    this.element.id = this.id
    this.element.src = this.url
    onRemoveFromDOM(this.element, this.destroy)
  }

  public async initialize() {
    this.transport = new Provider<any, any>({
      id: this.id,
      childOrigin: this.consumerOrigin,
      ...this.widget.externalizeAsProvider(),
      resize: () => this.resizer?.resize(),
      setSize: (size: Size) => this.resizer?.setSize(size)
    })
    this.resizer = new Resizer(this.element, this.transport)
    this.provider = this.transport.provider
    this.consumer = await new Promise((resolve) =>
      this.transport?.once('ready', resolve)
    )
    await this.consumer.initialize()
    await this.resizer.resize()
    this.consumer.watchSize()

    return this.consumer
  }

  /**
   * Подписка на изменение видимой области iframe
   *
   * @param callback Функция обратного вызова
   */
  public subscribeVisibleAreaChange(callback: Callback) {
    this.subscribeViewportChange()

    const onViewportChange = () => {
      callback(this.getVisibleArea())
    }

    this.on('viewportChange', onViewportChange)

    return () => {
      this.removeListener('viewportChange', onViewportChange)
    }
  }

  public getVisibleArea(): VisibleArea {
    return getVisibleArea(this.element)
  }

  private subscribeViewportChange() {
    this.viewportManager ??= createViewportManager(
      this.element,
      this.updateViewport,
      this.reduceViewportChange
    )
  }

  /**
   * Обработчик скролла
   */
  public updateViewport = () => {
    this.emit('viewportChange')
  }

  /**
   * Пересчитать размеры айфрейма
   */
  public resize() {
    this.resizer?.resize()
  }

  /**
   * Метод вызывается при удалении айфрейма
   */
  public destroy = () => {
    if (!this.destroyed) {
      this.destroyed = true
      removeFromDOM(this.element)
      this.emit('destroy')
      this.transport?.destroy()
      this.removeAllListeners()
      this.viewportManager?.destroy()
    }
  }
}
