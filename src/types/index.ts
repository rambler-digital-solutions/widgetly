/** Base callback */
export interface Callback {
  (...args: any[]): any
}

/** Base debounce */
export interface Debounce {
  <T extends Callback>(func: T): T
}

/** Size */
export interface Size {
  width: number
  height: number
}
