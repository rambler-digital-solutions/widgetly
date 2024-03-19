/* eslint-disable import/no-unused-modules */
export {registerIFrame, type IFrameConsumerConfig} from './iframe/consumer'
export {EmbedLayout, type EmbedLayoutConfig} from './layouts/embed-layout'
export {OverlayLayout, type OverlayLayoutConfig} from './layouts/overlay-layout'
export {
  globalViewportEvents,
  mutationEvents,
  setMutationParams,
  createViewportManager,
  type ViewportManager
} from './utils/dom'
export {getVisibleArea, type VisibleArea} from './utils/dom/viewport'
export type {Container} from './container'
export type {Widget, WidgetConfig} from './widget'
export {createMediator, Mediator, type MediatorConfig} from './mediator'
