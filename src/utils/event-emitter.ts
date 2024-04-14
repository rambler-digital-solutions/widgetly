import BaseEventEmitter from 'events'

interface ExternalizeEmitterParams {
  withEmit?: boolean
}

export type ExternalizedEmitter = Pick<
  EventEmitter,
  'on' | 'once' | 'removeListener' | 'emit'
>

export class EventEmitter extends BaseEventEmitter {
  public constructor() {
    super()
    this.setMaxListeners(Infinity)
  }

  public externalizeEmitter(
    params: ExternalizeEmitterParams = {}
  ): ExternalizedEmitter {
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
