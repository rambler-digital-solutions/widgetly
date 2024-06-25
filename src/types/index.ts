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

type ArgumentTypes<F extends () => any> = F extends (...args: infer A) => any
  ? A
  : never

export type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: ArgumentTypes<T[K]>) => Promise<ReturnType<T[K]>>
    : T[K] extends object
      ? Promisify<T[K]>
      : T[K]
}
