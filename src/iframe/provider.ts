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
 * Wrapper over an iframe
 *
 * @event viewportChange Event when the viewport of the element changes
 * @event destroy Termination of the provider
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
   * Creating a new provider instance
   *
   * @param url URL to load the iframe from
   * @param widget Widget object
   * @param id Unique widget identifier
   * @param reduceViewportChange Method to debounce viewport change tracking
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

  /**
   * Get the current iframe element
   */
  public getElement() {
    return this.element
  }

  /**
   * Create an iframe element
   */
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

  /**
   * Initialization of the iframe provider
   */
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
   * Subscription to changes in the visible area of the iframe
   *
   * @param callback Callback function
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

  /**
   * Get the visible area of the iframe
   */
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
   * Scroll event handler
   */
  public updateViewport = () => {
    this.emit('viewportChange')
  }

  /**
   * Recalculate iframe sizes
   */
  public resize() {
    this.resizer?.resize()
  }

  /**
   * Method called when removing the iframe
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
