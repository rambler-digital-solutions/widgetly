import {virtual} from '../utils/decorators'
import EventEmitter from '../utils/EventEmitter'
import {onRemoveFromDOM} from '../utils/DOM'
import randomId from '../utils/randomId'
import {mixin} from 'core-decorators'

/**
 * Класс с базовым layout
 */
@mixin(EventEmitter.prototype)
export default class BaseLayout {

  constructor(config) {
    EventEmitter.call(this)
    this.id = randomId()
    this.element = document.createElement('div')
    this.config = config
    onRemoveFromDOM(this.element, this.destroy)
  }

  getElement() {
    return this.element
  }

  /**
   * @virtual
   * Показать загрузчик (спиннер)
   */
  @virtual
  showLoading() {}

  /**
   * @virtual
   * Скрыть загрузчик (спиннер)
   */
  @virtual
  hideLoading() {}

  /**
   * @virtual
   * Установить контент (или добавить iframe)
   */
  @virtual
  setContent() {}

  /**
   * @virtual
   * Добавить этот лэйаут к элементу
   */
  @virtual
  addToDOM() {}

  /**
   * @virtual
   * Скрыть лэйаут (возможно с анимацией)
   */
  @virtual
  hide() {}

  /**
   * @virtual
   * Показать лэйаут
   */
  @virtual
  show() {}

  /**
   * @virtual
   * Удалить лэйаут из DOM
   */
  @virtual
  destroy() {}

}
