import {EventEmitter} from './utils/event-emitter'
import {
  onRemoveFromDOM,
  createViewportManager,
  type ViewportManager
} from './utils/dom'
import {isVisible} from './utils/dom/viewport'
import type {Debounce} from './types'
import type {Widget} from './widget'

/**
 * Container element
 */
export interface ContainerElement extends HTMLElement {
  rcWidget?: Widget
}

/**
 * Options for waiting when the container enters the viewport
 */
export interface EnterViewportOptions {
  /** Enable lazy loading, default is false */
  lazy?: boolean
  /** Offset for lazy loading, default is 300 */
  offset?: number
}

/**
 * Container for widgets
 */
export class Container extends EventEmitter {
  private element: ContainerElement
  private reduceViewportChange?: Debounce
  private ready?: Promise<void>
  private viewportManager?: ViewportManager
  private destroyed = false

  /**
   * Container constructor
   *
   * @param element Container's DOM element
   * @param reduceViewportChange Function to throttle viewport change events
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
   * Append content element
   */
  public appendChild(element: HTMLElement) {
    this.element.appendChild(element)
  }

  /**
   * Manually destroy the container
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
   * Returns a Promise that resolves when the container enters the viewport from the top
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
