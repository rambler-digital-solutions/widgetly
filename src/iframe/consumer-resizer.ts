import throttle from 'lodash.throttle'
import type {Consumer} from 'magic-transport'
import {mutationEvents, setMutationParams} from '../utils/dom'
import {EventEmitter} from '../utils/event-emitter'
import type {Size} from '../types'

setMutationParams({
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
})

export class IFrameResizer {
  private events: EventEmitter
  private transport: Consumer<any, any>
  private currentSize?: Size

  public constructor(transport: Consumer<any, any>) {
    this.events = new EventEmitter()
    this.transport = transport
  }

  public getSize() {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  }

  public resize = throttle(
    () => {
      const newSize = this.getSize()
      const isSizeChanged =
        !this.currentSize ||
        newSize.width !== this.currentSize.width ||
        newSize.height !== this.currentSize.height

      if (isSizeChanged) {
        ;(this.transport.provider as any).setSize(newSize)
        this.currentSize = newSize
        this.events.emit('resize', this.currentSize)
      }
    },
    60,
    {leading: true, trailing: true}
  )

  public watchSize() {
    mutationEvents.on('mutation', this.resize)
  }
}
