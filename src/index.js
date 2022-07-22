import Mediator from './Mediator'

export default (...args) => new Mediator(...args)

export {registerIFrame} from './iframe/Consumer'

export {default as EmbedLayout} from './layouts/EmbedLayout'
export {default as OverlayLayout} from './layouts/OverlayLayout'
export {default as SidebarLayout} from './layouts/SidebarLayout'
