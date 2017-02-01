export const once = (target, key, descriptor) => ({
  ...descriptor,
  value(...args) {
    this.__invokedFunctions = this.__invokedFunctions || []
    this.__invokedFunctionResults = this.__invokedFunctionResults || []
    const fn = descriptor.value
    const index = this.__invokedFunctions.indexOf(fn)
    if (index === -1) {
      const result = fn.call(this, ...args)
      this.__invokedFunctions.push(fn)
      this.__invokedFunctions.push(result)
      return result
    }
    return this.__invokedFunctionResults[index]
  }
})

export const virtual = (target, key, descriptor) => ({
  ...descriptor,
  value() {
    throw new Error(`Method "${key}" should be overrided`)
  }
})
