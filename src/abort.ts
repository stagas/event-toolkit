import type { Fn } from 'everyday-types'
import { bool, toFluent } from 'to-fluent'

export class AbortOptions {
  throw = bool
  latest = bool
  timeout?: number
}

export const abort = toFluent(
  AbortOptions,
  options =>
    <P extends any[], R extends Promise<any>>(fn: (signal: AbortSignal) => Fn<P, R>) => {
      let ctrl: AbortController
      return async function(this: any, ...args: P) {
        if (options.latest && ctrl) ctrl.abort()
        ctrl = new AbortController()
        if (options.timeout != null) {
          const timeoutError = new Error('Timed out')
          try {
            return await Promise.race([
              new Promise((_, reject) => setTimeout(reject, options.timeout, timeoutError)),
              fn(ctrl.signal).apply(this, args),
            ])
          } catch (error) {
            if (error === timeoutError) {
              ctrl.abort()
              if (options.throw)
                throw error
              else
                console.warn(error)
            } else {
              if (options.throw)
                throw error
              else
                console.warn(error)
            }
          }
        } else {
          return fn(ctrl.signal).apply(this, args)
        }
      }
    }
)
