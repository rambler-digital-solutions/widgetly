import EventEmitter from 'events'

export default function Emitter() {
  EventEmitter.call(this)
  this.setMaxListeners(Infinity)
}

Object.assign(Emitter.prototype, EventEmitter.prototype, {

  externalizeEmitter(params = {}) {
    const methods = ['on', 'once', 'removeListener']
    const emitter = this
    if (params.withEmit)
      methods.push('emit')
    return methods.reduce((result, method) => {
      result[method] = (...args) => {
        emitter[method](...args)
      }
      return result
    }, {})
  }

})
