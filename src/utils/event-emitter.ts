import BaseEventEmitter from 'events'

interface EventEmitterAPIParams {
  withEmit?: boolean
}

export type EventEmitterAPI = Pick<
  BaseEventEmitter,
  'on' | 'once' | 'removeListener' | 'emit'
>

export class EventEmitter extends BaseEventEmitter {
  public constructor() {
    super()
    this.setMaxListeners(Infinity)
  }

  public externalizeEmitter(
    params: EventEmitterAPIParams = {}
  ): EventEmitterAPI {
    const methods: (keyof EventEmitter)[] = ['on', 'once', 'removeListener']

    if (params.withEmit) {
      methods.push('emit')
    }

    return methods.reduce(
      (result, method) => {
        result[method] = (...args: any[]) => {
          ;(this[method] as any)?.(...args)
        }

        return result
      },
      {} as Record<keyof EventEmitter, any>
    )
  }
}
