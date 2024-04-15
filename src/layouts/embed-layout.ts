import {removeFromDOM, setClass, toggleClass, findById} from '../utils/dom'
import type {Container} from '../container'
import type {ContentElement} from './content-element'
import {BaseLayout} from './base-layout'
import css from './embed-layout.css'

/**
 * Embedded layout configuration
 */
export interface EmbedLayoutConfig {
  /** Spinner HTML template */
  spinner?: string
}

/**
 * Embedded layout
 *
 * @event destroy Destroy layout
 */
export class EmbedLayout extends BaseLayout<EmbedLayoutConfig> {
  private spinner: string
  private contentId: string
  private loaderId: string
  private contentElement: HTMLElement
  private loaderElement: HTMLElement
  private destroyed = false

  /**
   * Creating a new layout
   *
   * @param config Layout configuration
   */
  public constructor(config: EmbedLayoutConfig = {}) {
    super(config)
    this.spinner = config.spinner ?? ''
    this.contentId = `${this.id}_content`
    this.loaderId = `${this.id}_loader`
    this.element.innerHTML = `
      <div class="${css.EmbedLayout__wrapper}">
        ${
          this.spinner
            ? `<div class="${css.EmbedLayout__loader}" id="${this.loaderId}">${this.spinner}</div>`
            : ''
        }
        <div class="${css.EmbedLayout__content}" id="${this.contentId}"></div>
      </div>
    `
    this.contentElement = findById(this.contentId, this.element) as HTMLElement
    this.loaderElement = findById(this.loaderId, this.element) as HTMLElement
    setClass(this.element, css.EmbedLayout, css['is-hidden'])
  }

  /**
   * Add current object to container
   * @param container Container to which the current element is added
   */
  public addToDOM(container: Container) {
    this.container = container
    this.container.appendChild(this.getElement())
  }

  /**
   * Show loader
   */
  public showLoading() {
    this.toggleLoading(true)
  }

  /**
   * Hide loader
   */
  public hideLoading() {
    this.toggleLoading(false)
  }

  /**
   * Hide layout
   */
  public hide() {
    toggleClass(this.element, true, css['is-hidden'])
  }

  /**
   * Show layout
   */
  public show() {
    toggleClass(this.element, false, css['is-hidden'])
  }

  /**
   * Show/hide loader
   * @param show Flag to hide/show loader
   */
  public toggleLoading(show: boolean) {
    toggleClass(this.element, show, css['is-loading'])
    toggleClass(this.loaderElement, show, css['is-shown'])
  }

  /**
   * Set content in the layout
   * @param content Layout content
   */
  public setContent(content: ContentElement) {
    this.content = content
    this.contentElement.appendChild(content.getElement())
  }

  /**
   * Remove element from DOM
   */
  public destroy = () => {
    if (!this.destroyed) {
      this.destroyed = true
      removeFromDOM(this.element)
      this.emit('destroy')
    }
  }
}
