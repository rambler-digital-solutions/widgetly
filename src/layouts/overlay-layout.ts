import {
  removeFromDOM,
  onRemoveFromDOM,
  setClass,
  toggleClass,
  findById
} from '../utils/dom'
import type {ContentElement} from './content-element'
import {BaseLayout} from './base-layout'
import css from './overlay-layout.css'

const ANIMATION_DURATION = 200

/**
 * Overlay layout configuration for modal window
 */
export interface OverlayLayoutConfig {
  /** HTML template for spinner */
  spinner?: string
  /** CSS class added to element */
  className?: string
  /** Duration of opacity animation in ms, default 200 */
  animationDuration?: number
  /** Add hidden layout to DOM */
  hidden?: boolean
}

/**
 * Layout for modal window
 *
 * @event destroy Destroy layout
 */
export class OverlayLayout extends BaseLayout<OverlayLayoutConfig> {
  private spinner: string
  private contentId: string
  private loaderId: string
  private contentElement: HTMLElement
  private loaderElement: HTMLElement
  private moveBehindTimeout?: number
  private destroyed = false

  /**
   * Create a new layout
   *
   * @param config Layout configuration
   */
  public constructor(config: OverlayLayoutConfig = {}) {
    super(config)
    this.config.animationDuration ??= ANIMATION_DURATION
    this.spinner = config.spinner ?? ''
    this.element = document.createElement('div')
    this.contentId = `${this.id}_content`
    this.loaderId = `${this.id}_loader`
    this.element.innerHTML = `
      <div class="${css.OverlayLayout__wrapper}">
        ${
          this.spinner
            ? `<div class="${css.OverlayLayout__loader}" id="${this.loaderId}">${this.spinner}</div>`
            : ''
        }
        <div class="${css.OverlayLayout__content}" id="${this.contentId}"></div>
      </div>
    `
    this.contentElement = findById(this.contentId, this.element) as HTMLElement
    this.loaderElement = findById(this.loaderId, this.element) as HTMLElement
    setClass(
      this.element,
      css.OverlayLayout,
      css['is-hidden'],
      config.className,
      !!this.config.animationDuration && css['no-animate']
    )
    onRemoveFromDOM(this.element, this.destroy)
  }

  /**
   * Show current layout
   */
  public addToDOM() {
    if (this.config.hidden) {
      this.moveBehind()
      this.hide()
    }

    this.container = document.body
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
   * Move layout behind
   */
  public moveBehind = () => {
    toggleClass(this.element, true, css['is-behind'])
  }

  /**
   * Move layout to front
   */
  public moveFront = () => {
    toggleClass(this.element, false, css['is-behind'])
  }

  /**
   * Hide layout
   */
  public hide() {
    toggleClass(this.element, true, css['is-hidden'])
    window.clearTimeout(this.moveBehindTimeout)
    this.moveBehindTimeout = window.setTimeout(
      this.moveBehind,
      this.config.animationDuration
    )
  }

  /**
   * Show layout
   */
  public show() {
    toggleClass(this.element, false, css['is-hidden'])
    window.clearTimeout(this.moveBehindTimeout)
    this.moveFront()
  }

  /**
   * Toggle loader visibility
   * @param show Flag to show/hide loader
   */
  public toggleLoading(show: boolean) {
    toggleClass(this.element, show, css['is-loading'])
    toggleClass(this.loaderElement, show, css['is-shown'])
  }

  /**
   * Set content in layout
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
      window.clearTimeout(this.moveBehindTimeout)
      removeFromDOM(this.element)
      this.emit('destroy')
    }
  }
}
