import {EventEmitter} from '../utils/event-emitter'
import {onRemoveFromDOM} from '../utils/dom'
import {randomId} from '../utils/random-id'
import type {Container} from '../container'
import type {ContentElement} from './content-element'

/**
 * Базовый лэйаут
 *
 * @event destroy Закрытие лэйаута
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

  public getElement() {
    return this.element
  }

  /**
   * Показать загрузчик (спиннер)
   */
  abstract showLoading(): void

  /**
   * Скрыть загрузчик (спиннер)
   */
  abstract hideLoading(): void

  /**
   * Установить контент (или добавить iframe)
   */
  abstract setContent(content: ContentElement): void

  /**
   * Добавить этот лэйаут к элементу
   */
  abstract addToDOM(container: Container): void

  /**
   * Скрыть лэйаут (возможно с анимацией)
   */
  abstract hide(): void

  /**
   * Показать лэйаут
   */
  abstract show(): void

  /**
   * Удалить лэйаут из DOM
   */
  abstract destroy(): void
}
