import {removeFromDOM, setClass, toggleClass, findById} from '../utils/dom'
import type {Container} from '../container'
import type {ContentElement} from './content-element'
import {BaseLayout} from './base-layout'
import css from './embed-layout.css'

/**
 * Конфигурация встроенного виджета
 */
export interface EmbedLayoutConfig {
  /** HTML-шаблон спиннера */
  spinner?: string
}

/**
 * Встроенный виджет
 *
 * @event destroy Закрытие лэйаута
 */
export class EmbedLayout extends BaseLayout<EmbedLayoutConfig> {
  private spinner: string
  private contentId: string
  private loaderId: string
  private contentElement: HTMLElement
  private loaderElement: HTMLElement
  private destroyed = false

  /**
   * Создание новой инстанции виджета
   *
   * @param config Конфигурация виджета
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
   * Добавить текущий объект к контейнеру
   * @param container Контейнер, к которому добавляем текущий элемент
   */
  public addToDOM(container: Container) {
    this.container = container
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
   * Скрыть лэйаут
   */
  public hide() {
    toggleClass(this.element, true, css['is-hidden'])
  }

  /**
   * Показать лэйаут
   */
  public show() {
    toggleClass(this.element, false, css['is-hidden'])
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
      removeFromDOM(this.element)
      this.emit('destroy')
    }
  }
}
