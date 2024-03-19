import type {Provider} from 'magic-transport'
import type {Size} from '../types'

export class Resizer {
  private container: HTMLElement
  private transport: Provider<any, any>

  public constructor(container: HTMLElement, transport: Provider<any, any>) {
    this.container = container
    this.transport = transport
  }

  public async resize() {
    const size = await (this.transport.consumer as any).getSize()

    this.setSize(size)
  }

  public setSize({height}: Size) {
    this.container.style.height = `${height}px`
  }
}
