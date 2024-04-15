# Widgetly

Library helps you to create widgets, including widgets that work via an iframe.

## Main goals

* Reusable Widgets: extract some business logic into a universal widget, which can then be easily reused across various applications. A single widget can be integrated into numerous applications without the need to change its code.
* API: create an external interface for interacting with the widget, that provides for developers methods to control the widget, receive data from it, and send data to the widget.
* Transport: use built-in mechanism for sync data and methods between the application, widget, and iframe, without using `postMessage` directly.
* Framework agnostic: use any libraries and frameworks to create widgets and applications that embed them, increasing flexibility and development speed.

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

```ts
mediator.defineWidget(config, properties)
```

#### Embedded widgets

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
    await this.container.whenEnterViewport({lazy: true})
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

#### Overlay widgets

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
    this.layout = new OverlayLayout({hidden: true})
    this.layout.setContainer(this.container)
    this.layout.setContent(this.iframe)
    // Wait until the widget renders in iframe
    await this.iframe.initialize()
    this.layout.show()
  }
})
```

### Layout

Layout is an element into which an iframe and loader are inserted.

There are following types of layouts:

* EmbedLayout – Embeds into a specific element on the page
* OverlayLayout – Overlay, can be used for modal windows

### Widgets with iframe

Inside the iframe, you need to wrap the initialization of your widget.

```ts
registerIFrame(config, properties)
```

#### Example

```tsx
// ./app.tsx
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

```tsx
// ./iframe.tsx
import React from 'react'
import {createRoot} from 'react-dom/client'
import {registerIFrame} from 'widgetly'
import {App} from './app'

const rootElement = document.getElementById('my_app')
const root = createRoot(rootElement)

registerIFrame({
  async initialize() {
    await new Promise(resolve => {
      root.render(
        <App 
          transport={this} 
          onReady={resolve} 
        />
      )
    })
  }
})
```

### Using widgets

The mediator can automatically create widgets in containers with the corresponding data attributes when it appears in the DOM.

```ts
// ./app.ts
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

Or create widget through the factory to gain full control over the widget.

```ts
mediator.buildWidget(name, containerElement, params)
```

#### Example of creating a widget

```ts
// ./app.ts
import mediator from './mediator'

const container = document.getElementById('my_comments');

mediator.buildWidget('EmbedComments', container, {
  appId: APP_ID,
  pageUrl: window.location.pathname
}).then(widget => {
  // At this moment, you can use the widget external methods
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
