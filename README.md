# Widgetly

Widgetly помогает создавать виджеты, в том числе работающие через iframe

## Mediator

Медиатор - это инстанция фабрики `widgetly`, после создания инстанции, можно декларировать виджеты. Если вы используете iframe-виджеты, то этот код нужно размещать в родительском окне.

```js
// ./mediator.js
import widgetly from 'widgetly'

export default const mediator = widgetly({
  // префикс для data-атрибутов при вставке виджетов через HTML-код
  prefix: 'rc'
}, {
  myMethod() {
    return 1
  },
  someProp: {
    someMethod() {
      return 2
    }
  }
})
```

## Декларация виджетов

После декларации медиатора, можно начать декларировать виджеты. Виджет декларируется через фабрику, которая имеет следующий интерфейс (Поля, отмеченные `*` - обязательны):

```js
mediator.defineWidget(config, properties)
```

| Название параметра | Тип | Описание |
|---|---|---|
| `config` | `Object*` | Конфиг виджета |
| `config.name` | `String*` | Название виджета |
| `config.initialize` | `Function*` | Функция инициализации виджета. Должна возвращать `Promise` |
| `config.destroy` | `Function` | Функции уничтожения виджета |
| `config.externalizeAsProvider` | `Function` | Функция должна экспортировать объект с методами, доступными для `this.iframe` |
| `config.externalize` | `Function` | Функция должна экспортировать объект с методами, доступными внешнему потребителю, по умолчанию экспортирует все `properties` (см. ниже) и свойства, которые экспортировал `this.iframe`, если он есть |
| properties | `Object` | Дополнительные свойства виджета |

### Пример встроенного виджета

```js
// ./widget.js
import mediator from './mediator'
// импортируем лэйаут встроенного виджета
import {EmbedLayout} from 'widgetly'

// декларируем виджет
mediator.defineWidget({
  // название виджета 
  name: 'EmbedComments',

  // функция инициализации виджета
  // этот метод должен возвращать Promise
  // в этом методе должен отрисовывать виджет
  initialize() {
    // Доступные свойства на момент инициализации:
    // this.params - параметры создания виджета
    // this.container - контейнер виджета
    // this.createIframe(url) - создать айфрейм, привязанный к текущему виджету
    
    return this.container.whenEnterViewport({ lazy: true }).then(() => {
      this.iframe = this.createIframe(iframeUrl)
      this.layout = new EmbedLayout({
        spinner: '<div class="Spinner" />'
      })
      this.layout.showLoading()
      this.layout.addToDOM(this.container)
      this.layout.setContent(this.iframe)
      return this.iframe.initialize().then(() => this.layout.hideLoading())
    })
  }
}, {
  // Все методы, объявленные здесь, обоготят this
  hide() {
    this.layout.hide()
  },

  show() {
    this.layout.show()
  }
})
```

### Пример виджета открываемого в модальном окне

```js
// ./widget.js
import mediator from './mediator'
// импортируем лэйаут встроенного виджета
import {OverlayLayout} from 'widgetly'

// декларируем виджет
mediator.defineWidget({
  // название виджета 
  name: 'LoginModal',

  // функция инициализации виджета
  // этот метод должен возвращать Promise
  // в этом методе должен отрисовывать виджет
  initialize() {
    // Доступные свойства на момент инициализации:
    // this.params - параметры создания виджета
    // this.container - контейнер виджета
    // this.createIframe(url) - создать айфрейм, привязанный к текущему виджету
    
    this.iframe = this.createIframe(iframeUrl)
    this.layout = new OverlayLayout({ hidden: true })
    this.layout.setContainer(this.container)
    this.layout.setContent(this.iframe)
    return this.iframe.initialize().then(() => this.layout.show())
  }
})
```

## Лэйаут

Лэйаут представляет собой элемент, в который вставляется iframe и лоадер.

Лэйауты существуют следующих типов:

| Тип | Описание |
|-----|----------|
| EmbedLayout | Лэйаут встраиваемый в конкретный элемент на странице |
| OverlayLayout | Лэйаут-оверлей, может использоваться для модальных окон |
| SidebarLayout | Лэйаут для виджета, показываемого в сайдбаре |

Каждый лэйаут должен реализовывать следующий интерфейс:

| Метод/Свойство | Описание |
|----------------|----------|
| `constructor(options)` | Конструктор класса |
| `initialize(container)`| Инициализация виджета |
| `showLoading()` | Показать статус загрузки |
| `hideLoading()` | Скрыть статус загрузки |
| `setContent({ContentElement})` | Установить контент для лэйаута |
| `hide()` | Скрыть лэйаут |
| `show()` | Показать лэйаут |
| `destroy()` | Этот метод должен удалять `layout.element` из DOM |
| `id` | уникальный ID лэйаута |
| `events` | EventEmitter лэйаута. Должен кидать следующие события: `destroy` |
| `element` | Рутовый элемент лэйаута |

## Виджет 

## Лицензия

MIT
