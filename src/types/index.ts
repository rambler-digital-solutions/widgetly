export interface Callback {
  (...args: any[]): any
}

export interface Debounce {
  <T extends Callback>(func: T): T
}

export interface Size {
  width: number
  height: number
}
