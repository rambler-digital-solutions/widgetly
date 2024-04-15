import {EventEmitter} from '../utils/event-emitter'
import {onRemoveFromDOM} from '../utils/dom'
import {randomId} from '../utils/random-id'
import type {Container} from '../container'
import type {ContentElement} from './content-element'

/**
 * Basic layout
 *
 * @event destroy Destroy layout
 */
export abstract class BaseLayout<T = any> extends EventEmitter {
  public id: string
  public element: HTMLElement
  protected config: T
  protected container?: Container | HTMLElement
  protected content?: ContentElement

  public constructor(config: T) {
    super()
    this.id = randomId()
    this.element = document.createElement('div')
    this.config = config
    onRemoveFromDOM(this.element, this.destroy)
  }

  /**
   * Get the current layout element
   */
  public getElement() {
    return this.element
  }

  /**
   * Show the loader (spinner)
   */
  abstract showLoading(): void

  /**
   * Hide the loader (spinner)
   */
  abstract hideLoading(): void

  /**
   * Set content (or add iframe)
   */
  abstract setContent(content: ContentElement): void

  /**
   * Add this layout to an element
   */
  abstract addToDOM(container: Container): void

  /**
   * Hide the layout (possibly with animation)
   */
  abstract hide(): void

  /**
   * Show the layout
   */
  abstract show(): void

  /**
   * Remove the layout from the DOM
   */
  abstract destroy(): void
}
