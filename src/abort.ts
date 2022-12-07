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
    <P extends any[], R>(fn:
      (signal: AbortSignal) => Fn<P, R>
    ): Fn<P, R extends Promise<any> ? R : Promise<R>> => {
      let ctrl: AbortController

      const wrap = Object.assign(async function wrap(this: any, ...args: P) {
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
              else {
                //!warn error
              }
            } else {
              if (options.throw)
                throw error
              else {
                //!warn error
              }
            }
          }
        } else {
          return fn(ctrl.signal).apply(this, args)
        }
        // @ts-ignore
      }, { fn: fn() })

      return wrap as any
    }
)
