import { bool, toFluent } from 'to-fluent'
import { chain, run, Task } from './task'
import type { Fn } from './types'

export class QueueOptions {
  first = bool
  last = bool
  next = bool

  raf = bool
  task = bool
  time = bool

  debounce?: number
  throttle?: number
}

export const wrapQueue = (options: QueueOptions) =>
  <P extends any[]>(fn: Fn<P, any>) => {
    const queued: Task[] = []
    let queueFn: Fn<[Fn<any, any>], any>
    let id: any
    let last: any
    let runs = false

    if (options.raf) queueFn = requestAnimationFrame
    else if (options.task) queueFn = queueMicrotask
    else if (options.time) queueFn = setTimeout
    else if (options.throttle != null) {
      queueFn = fn => {
        setTimeout(fn, options.throttle)
      }
    } else if (options.debounce != null) {
      queueFn = fn => {
        clearTimeout(id)
        id = setTimeout(fn, options.debounce)
      }
    } else {
      // No queue function provided, return identity.
      // This is used when extending this in `event`.
      return fn
    }

    if (options.first == null && options.last == null) {
      if (options.throttle != null)
        options.first = true
      else if (options.debounce != null)
        options.last = true
      else
        options.next = true
    }

    const cb = () => {
      let task: Task

      if (queued.length) {
        if (options.last) {
          if (options.next) {
            const left = queued.splice(0, queued.length - 1)
            task = left.pop() ?? queued.pop()!
            chain(left, task)
            last = run(task)
            if (queued.length) {
              queueFn(cb)
              return
            }
          } else {
            task = queued.pop()!
            chain(queued.splice(0), task)
            last = run(task)
          }
        } else if (options.next) {
          task = queued.shift()!
          chain(queued.splice(0, queued.length - 1), task)
          queueFn(cb)
          last = run(task)
          return
        } else {
          task = Task()
          chain(queued.splice(0), task)
          task.resolve(last)
        }
      }

      runs = false
    }

    return function(this: any, ...args: P) {
      const task = Task(fn, this, args)

      if (!runs) {
        queueFn(cb)

        if (!runs && options.first) {
          runs = true
          last = run(task)
          return task.promise
        }
      }

      runs = true
      queued.push(task)

      return task.promise
    }
  }

/**
 * Decorate function `fn` with a queue function.
 *
 * The decorated function will returns a `Promise` that resolves with its result.
 * All calls will be resolved with latest result at any given quantum.
 *
 * Options:
 * - `first` => Run only first, then debounce.
 * - `last` => Run last (default behavior when using `debounce`).
 * - `next` => Run final subsequent call on next quantum (default behavior when nothing is set and not a `debounce`).
 *
 * - `raf` => Queue with `requestAnimationFrame`.
 * - `task` => Queue with `queueMicrotask`.
 * - `time` => Queue with `setTimeout`.
 *
 * - `debounce(ms)` => Debounce at specified `ms`.
 * - `throttle(ms)` => Throttle at specified `ms`.
 *
 * ```ts
 * fn = (x: number) => console.log(x)
 *
 * const cb = queue.task((x: number) => count += x)
 * cb(1) // passes (after task)
 * cb(2) // discarded
 * cb(3) // discarded
 * cb(4) // passes
 *
 * const cb = queue.task.last((x: number) => count += x)
 * cb(1) // discarded
 * cb(2) // discarded
 * cb(3) // discarded
 * cb(4) // passes
 *
 * const cb = queue.task.first((x: number) => count += x)
 * cb(1) // passes (before task)
 * cb(2) // discarded
 * cb(3) // discarded
 * cb(4) // discarded
 *
 * const cb = queue.task.first.last((x: number) => count += x)
 * cb(1) // passes (before task)
 * cb(2) // discarded
 * cb(3) // discarded
 * cb(4) // passes
 *
 * const cb = queue.task.first.last.next((x: number) => count += x)
 * cb(1) // passes (before task)
 * cb(2) // discarded
 * cb(3) // passes (after task)
 * cb(4) // passes (next task)
 *
 * const cb = queue.task.last.next((x: number) => count += x)
 * cb(1) // discarded
 * cb(2) // discarded
 * cb(3) // passes (after task)
 * cb(4) // passes (next task)
 * ```
 */
export const queue = toFluent(QueueOptions, wrapQueue)
