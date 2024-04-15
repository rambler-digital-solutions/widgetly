import {EventEmitter} from './utils/event-emitter'
import {
  onRemoveFromDOM,
  createViewportManager,
  type ViewportManager
} from './utils/dom'
import {isVisible} from './utils/dom/viewport'
import type {Debounce} from './types'
import type {Widget} from './widget'

interface ContainerElement extends HTMLElement {
  rcWidget?: Widget
}

export interface EnterViewportOptions {
  /** Включить ленивую загрузку, по-умолчанию false */
  lazy?: boolean
  /** Оффсет для ленивой загрузки, по-умолчанию 300 */
  offset?: number
}

export class Container extends EventEmitter {
  private element: ContainerElement
  private reduceViewportChange?: Debounce
  private ready?: Promise<void>
  private viewportManager?: ViewportManager
  private destroyed = false

  /**
   * Конструктор контейнера
   *
   * @param element DOM-элемент контейнера
   * @param reduceViewportChange Функция замедления обработки изменений
   */
  public constructor(
    element: ContainerElement,
    reduceViewportChange?: Debounce
  ) {
    super()
    this.element = element
    this.reduceViewportChange = reduceViewportChange
    this.emit('ready')
    onRemoveFromDOM(this.element, this.destroy)
  }

  public getElement() {
    return this.element
  }

  /**
   * Добавить элемент с контентом
   */
  public appendChild(element: HTMLElement) {
    this.element.appendChild(element)
  }

  /**
   * Уничтожить контейнер вручную
   */
  public destroy = () => {
    if (!this.destroyed) {
      this.destroyed = true
      this.emit('destroy')
      this.removeAllListeners()
      this.viewportManager?.destroy()
    }
  }

  public updateViewport() {
    this.emit('viewportChange')
  }

  private subscribeScroll() {
    this.viewportManager ??= createViewportManager(
      this.element,
      this.onScroll,
      this.reduceViewportChange
    )
  }

  private onScroll = (event: Event) => {
    this.emit('viewportChange', event)
  }

  /**
   * Метод возвращает Promise, который резолвится, когда контейнер входит во вьюпорт сверху
   */
  public async whenEnterViewportFromTop(options: EnterViewportOptions) {
    const {lazy = false, offset = 300} = options
    const vpOptions = {offset, compliantScrollDown: true}

    if (lazy && !isVisible(this.element, vpOptions)) {
      this.ready ??= new Promise((resolve) => {
        this.subscribeScroll()

        const onScroll = () => {
          if (isVisible(this.element, vpOptions)) {
            this.removeListener('viewportChange', onScroll)
            resolve()
          }
        }

        this.on('viewportChange', onScroll)
      })
    }

    await this.ready
  }
}
