# Widgetly

Library helps you to create widgets, including widgets that work via an iframe.

## Main goals

- Reusable Widgets: Extract some business logic into a universal widget, which can then be easily reused across various applications. A single widget can be integrated into numerous applications without the need to change its code.
- API: Create an external interface for interacting with the widget, that provides for developers methods to control the widget, receive data from it, and send data to the widget.
- Transport: Use built-in mechanism for sync data and methods between the application, widget, and iframe, without using `postMessage` directly.
- Framework agnostic: Use any libraries and frameworks to create widgets and applications that embed them, increasing flexibility and development speed.

## Install

```sh
npm install widgetly
```

or

```sh
yarn add widgetly
```

## Usage

### Mediator

The Mediator is an instance of the widget factory. After creating an instance, you can declare widgets. If you are using iframe widgets, place this code in the parent window.

```ts
// ./mediator.ts
import {createMediator} from 'widgetly'

export const mediator = createMediator({
  // Prefix for data attributes when inserting widgets via HTML code
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

### Widget declaration

After creating the mediator, you can start declaring widgets via the factory.

```js
mediator.defineWidget(config, properties)
```

#### Embedded widget

```ts
// ./widget.ts
import {EmbedLayout} from 'widgetly'
import {mediator} from './mediator'

mediator.defineWidget({
  // Widget name
  name: 'EmbedComments',

  // Widget initialization function
  // - should return a Promise
  // - should render the widget
  async initialize() {
    // Wait until the widget enters the viewport
    await this.container.whenEnterViewport({ lazy: true })
    // Create an iframe tied to the current widget
    this.iframe = this.createIframe(iframeUrl)
    // Create an embedded layout
    this.layout = new EmbedLayout({
      spinner: '<div class="Spinner" />'
    })
    this.layout.showLoading()
    this.layout.addToDOM(this.container)
    this.layout.setContent(this.iframe)
    // Wait until the widget renders in iframe
    await this.iframe.initialize()
    this.layout.hideLoading()
  }
}, {
  // All methods declared here will enrich widget
  hide() {
    this.layout.hide()
  },

  show() {
    this.layout.show()
  }
})
```

#### Overlay widget

```ts
// ./widget.ts
import {OverlayLayout} from 'widgetly'
import {mediator} from './mediator'

mediator.defineWidget({
  // Widget name
  name: 'LoginModal',

  // Widget initialization function
  // - should return a Promise
  // - should render the widget
  async initialize() {
    // Create an iframe tied to the current widget
    this.iframe = this.createIframe(iframeUrl)
    // Create an overlay layout
    this.layout = new OverlayLayout({ hidden: true })
    this.layout.setContainer(this.container)
    this.layout.setContent(this.iframe)
    // Wait until the widget renders in iframe
    await this.iframe.initialize()
    this.layout.show()
  }
})
```

### Лэйаут

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

### IFrame

Внутри айфрейма нужно обернуть инициализацию вашего виджета:

```js
registerIFrame(config, properties)
```

| Название параметра | Тип | Описание |
|---|---|---|
| `config` | `Object*` | Конфиг |
| `config.initialize` | `Function*` | Функция инициализации виджета. Должна отрисовывать приложение и возвращать `Promise` |
| `config.externalizeAsConsumer` | `Function` | Этот метод должен возвращать фасад с методами, которые будут доступны виджету |
| `config.externalize` | `Function` | Этот метод должен возвращать фасад с методами, которые видны снаружи виджета |
| `properties` | `Object` | Дополнительные свойства |

#### Пример инициализации

```js
// ./app.js
import React, {useEffect} from 'react'

export const App = ({transport, onReady}) => {
  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <TransportContext.Provider value={transport}>
      <main>
        ...
      </main>
    </TransportContext.Provider>
  )
}
```

```js
// ./iframe.js
import React from 'react'
import {render} from 'react-dom'
import {registerIFrame} from 'widgetly'
import App from './app'

const container = document.getElementById('my_app')

registerIFrame({
  initialize() {
    return new Promise(resolve => {
      const app = (
        <App 
          transport={this} 
          onReady={resolve} 
        />
      )
      render(app, container)
    })
  }
})
```

### Использование виджетов

Медиатор может создавать виджеты автоматически в контейнеры с соответствующими data атрибутами при появлении его в DOM.

```js
// ./app.js
import React from 'react'
import './mediator'

export const App = () => {
  return (
    <div
      data-rc-widget="EmbedComments"
      data-rc-app-id={APP_ID}
      data-rc-page-url={window.location.pathname}
    />
  )
}
```

Для получения полного контроля над виджета, его можно создавать через фабрику, которая имеет следующий интерфейс (поля, отмеченные `*` - обязательны):

```js
mediator.buildWidget(name, containerElement, params)
```

| Название параметра | Тип | Описание |
|---|---|---|
| `name` | `String*` | Название виджета |
| `containerElement` | `HTMLElement|String*` | Элемент/селектор, в которой будет вставлен виджет |
| `params` | `Object*` | Параметры инициализации виджета |

#### Пример создания виджета

```js
// ./app.js
import mediator from './mediator'

const container = document.getElementById('my_comments');

mediator.buildWidget('EmbedComments', container, {
  appId: APP_ID,
  pageUrl: window.location.pathname
}).then(widget => {
  // В этот момент можно пользоваться методами инстанции виджета
});
```

## Documentation

Currently we only have the API which you can check [here](https://rambler-digital-solutions.github.io/widgetly/).

## Contributing

### Start

After you clone the repo you just need to run [`yarn`](https://yarnpkg.com/lang/en/docs/cli/#toc-default-command)'s default command to install and build the packages

```
yarn
```

### Testing

We have a test suite consisting of a bunch of unit tests to verify utils keep working as expected. Test suit is run in CI on every commit.

To run the tests

```
yarn test
```

To run the tests in watch mode

```sh
yarn test:watch
```

### Code quality

To run linting the codebase

```sh
yarn lint
```

To check typings

```sh
yarn typecheck
```

To check bundle size

```sh
yarn sizecheck
```

## Discussion

Please open an issue if you have any questions or concerns.

## License

MIT
