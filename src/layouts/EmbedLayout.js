import BaseLayout from './BaseLayout'
import css from './EmbedLayout.css'
import {removeFromDOM, setClass, toggleClass, findById} from '../utils/DOM'
import {once, autobind} from '../utils/decorators'

export default class EmbedLayout extends BaseLayout {
  /**
   * @param {String} spinner - HTML шаблон спиннера
   */
  constructor(config = {}) {
    super(config)
    this.spinner = config.spinner || ''
    this.contentId = `${this.id}_content`
    this.loaderId = `${this.id}_loader`
    this.element.innerHTML = `
      <div class="${css.EmbedLayout__wrapper}">
        ${
  this.spinner
    ? `<div class="${css.EmbedLayout__loader}" id="${this.loaderId}">${
      this.spinner
    }</div>`
    : ''
}
        <div class="${css.EmbedLayout__content}" id="${this.contentId}"></div>
      </div>
    `
    this.contentElement = findById(this.contentId, this.element)
    this.loaderElement = findById(this.loaderId, this.element)
    setClass(this.element, css.EmbedLayout, css['is-hidden'])
  }

  /**
   * Добавить текущий объект к контейнеру
   * @param {Container} container - Контейнер, к которому добавляем текущий элемент
   */
  addToDOM(container) {
    this.container = container
    this.container.appendChild(this.getElement())
  }

  /**
   * Показать загрузчик
   */
  showLoading() {
    this.toggleLoading(true)
  }

  /**
   * Скрыть загрузчик
   */
  hideLoading() {
    this.toggleLoading(false)
  }

  /**
   * Скрыть лэйаут
   */
  hide() {
    toggleClass(this.element, css['is-hidden'], true)

    this.emit('hide')
  }

  /**
   * Показать лэйаут
   */
  show() {
    toggleClass(this.element, css['is-hidden'], false)
  }

  /**
   * Показать/скрыть лоадер
   * @param {Boolean} show - Флаг скрытия/показа лоадера
   */
  toggleLoading(show) {
    toggleClass(this.element, css['is-loading'], show)
    toggleClass(this.loaderElement, css['is-shown'], show)
  }

  /**
   * Установить контент в лэйауте
   * @param {ContentElement} content - Контент лэйаута
   */
  setContent(content) {
    this.content = content
    this.contentElement.appendChild(content.getElement())
  }

  /**
   * Удаление элемента из DOM
   * В этот момент происходит отписка от событий
   */
  @autobind
  @once
  destroy() {
    removeFromDOM(this.element)
    this.emit('destroy')
  }
}
