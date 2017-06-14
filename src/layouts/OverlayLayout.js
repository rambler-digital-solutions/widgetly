// Модальный лэйаут, сразу показывается

import BaseLayout from './BaseLayout'
import css from './OverlayLayout.css'
import {autobind} from 'core-decorators'
import {once} from '../utils/decorators'
import {removeFromDOM, onRemoveFromDOM, setClass, toggleClass, findById} from '../utils/DOM'

const ANIMATION_DURATION = 200

export default class OverlayLayout extends BaseLayout {

  /**
   * @param {Object} options - опции
   * @param {String} [options.spinner] - HTML шаблон спиннера
   * @param {String} [options.className] - css-класс, который добавляем к элементу
   */
  constructor(options = {}) {
    super(options)
    this.spinner = options.spinner
    this.element = document.createElement('div')
    this.contentId = `${this.id}_content`
    this.loaderId = `${this.id}_loader`
    this.element.innerHTML = `
      <div class="${css.OverlayLayout__wrapper}">
        ${this.spinner ? `<div class="${css.Loader}" id="${this.contentId}">${this.spinner}</div>` : ''}
        <div class="${css.OverlayLayout__content}" id="${this.contentId}"></div>
      </div>
    `
    this.contentElement = findById(this.contentId, this.element)
    this.loaderElement = findById(this.loaderId, this.element)
    setClass(this.element, css.OverlayLayout, css['is-hidden'], options.className)
    onRemoveFromDOM(this.element, this.destroy)
  }

  /**
   * Показать текущий лэйаут
   */
  addToDOM() {
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
  showLoading() {
    this.toggleLoading(true)
  }

  /**
   * Скрыть загрузчик
   */
  hideLoading() {
    this.toggleLoading(false)
  }

  @autobind
  moveBehind() {
    toggleClass(this.element, css['is-behind'], true)
  }

  @autobind
  moveFront() {
    toggleClass(this.element, css['is-behind'], false)
  }

  /**
   * Скрыть лэйаут
   */
  hide() {
    toggleClass(this.element, css['is-hidden'], true)
    clearTimeout(this.moveBehindTimeout)
    this.moveBehindTimeout = setTimeout(this.moveBehind, ANIMATION_DURATION)
  }

  /**
   * Показать лэйаут
   */
  show() {
    toggleClass(this.element, css['is-hidden'], false)
    clearTimeout(this.moveBehindTimeout)
    this.moveFront()
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
    clearTimeout(this.moveBehindTimeout)
    removeFromDOM(this.element)
    this.emit('destroy')
  }

}
