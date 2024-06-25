/* eslint-disable import/no-unused-modules */
export {
  registerIFrame,
  type IFrameConsumer,
  type IFrameConsumerConfig
} from './iframe/consumer'
export type {IFrameProvider} from './iframe/provider'
export {BaseLayout} from './layouts/base-layout'
export {EmbedLayout, type EmbedLayoutConfig} from './layouts/embed-layout'
export {OverlayLayout, type OverlayLayoutConfig} from './layouts/overlay-layout'
export type {ContentElement} from './layouts/content-element'
export {
  globalViewportEvents,
  mutationEvents,
  setMutationParams,
  createViewportManager,
  type ViewportManager
} from './utils/dom'
export {getVisibleArea, type VisibleArea} from './utils/dom/viewport'
export type {
  Container,
  ContainerElement,
  EnterViewportOptions
} from './container'
export type {Widget, WidgetConfig, WidgetAPI} from './widget'
export type {Debounce, Callback} from './types'
export {
  createMediator,
  Mediator,
  type MediatorConfig,
  type MediatorAPI
} from './mediator'
