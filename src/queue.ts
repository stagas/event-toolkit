import type { Fn } from 'everyday-types'
import { bool, toFluent } from 'to-fluent'
import { groupTasks, runTask, Task } from './task'

export class QueueOptions {
  first = bool
  last = bool
  next = bool

  raf = bool
  task = bool
  time = bool

  atomic = bool

  debounce?: number
  throttle?: number
}

export const wrapQueue = (options: QueueOptions) =>
  <P extends any[], R>(fn: Fn<P, R>): Fn<P, R | Promise<R>> => {
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
    } else if (options.atomic)
      queueFn = fn => fn()
    else {
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
        if (options.atomic) {
          task = queued.shift()!
          runTask(task)
            .catch(console.warn)
            .finally(() => queued.length && queueFn(cb))
          return
        }
        if (options.last) {
          if (options.next) {
            const left = queued.splice(0, queued.length - 1)
            task = left.pop() ?? queued.pop()!
            groupTasks(task, left)
            last = runTask(task)
            if (queued.length) {
              queueFn(cb)
              return
            }
          } else {
            task = queued.pop()!
            groupTasks(task, queued.splice(0))
            last = runTask(task)
          }
        } else if (options.next) {
          task = queued.shift()!
          groupTasks(task, queued.splice(0, queued.length - 1))
          queueFn(cb)
          last = runTask(task)
          return
        } else {
          task = Task()
          groupTasks(task, queued.splice(0))
          task.resolve(last)
        }
        // queueFn(cb)
      }
      // else {
      runs = false
      // }
    }

    return function(this: any, ...args: P) {
      const task = Task(fn, this, args)

      if (!runs && options.first) {
        runs = true
        last = runTask(task)
        queueFn(cb)
        return task.promise
      }

      queued.push(task)

      if (!runs) {
        runs = true
        queueFn(cb)
      }

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
