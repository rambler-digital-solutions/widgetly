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
 * Конфигурация лейаута открываемого в модальном окне
 */
export interface OverlayLayoutConfig {
  /** HTML-шаблон спиннера */
  spinner?: string
  /** CSS-класс, который добавляем к элементу */
  className?: string
  /** Длительность opacity анимации в ms, по-умолчанию 200 */
  animationDuration?: number
  /** Добавить скрытый layout в DOM */
  hidden?: boolean
}

/**
 * Лейаут открываемый в модальном окне
 *
 * @event destroy Закрытие лэйаута
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
   * Создание нового лейаута
   *
   * @param config Конфигурация лейаута
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
   * Показать текущий лэйаут
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
   * Показать загрузчик
   */
  public showLoading() {
    this.toggleLoading(true)
  }

  /**
   * Скрыть загрузчик
   */
  public hideLoading() {
    this.toggleLoading(false)
  }

  /**
   * Переместить лэйаут назад
   */
  public moveBehind = () => {
    toggleClass(this.element, true, css['is-behind'])
  }

  /**
   * Переместить лэйаут вперед
   */
  public moveFront = () => {
    toggleClass(this.element, false, css['is-behind'])
  }

  /**
   * Скрыть лэйаут
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
   * Показать лэйаут
   */
  public show() {
    toggleClass(this.element, false, css['is-hidden'])
    window.clearTimeout(this.moveBehindTimeout)
    this.moveFront()
  }

  /**
   * Показать/скрыть лоадер
   * @param show Флаг скрытия/показа лоадера
   */
  public toggleLoading(show: boolean) {
    toggleClass(this.element, show, css['is-loading'])
    toggleClass(this.loaderElement, show, css['is-shown'])
  }

  /**
   * Установить контент в лэйауте
   * @param content Контент лэйаута
   */
  public setContent(content: ContentElement) {
    this.content = content
    this.contentElement.appendChild(content.getElement())
  }

  /**
   * Удаление элемента из DOM.
   * В этот момент происходит отписка от событий
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
