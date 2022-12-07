import type { Fn } from 'everyday-types'
import { shallowEqual } from 'everyday-utils'
import { bool, toFluent } from 'to-fluent'
import { taskGroup, taskRun, Task } from './task'

export interface Hooks {
  before?: () => void
  after?: () => void
}

export class QueueOptions {
  first = bool
  last = bool
  next = bool

  raf = bool
  task = bool
  time = bool

  atomic = bool
  concurrency?: number

  debounce?: number
  throttle?: number

  hooks?: Hooks
}

export const wrapQueue = (options: Partial<QueueOptions> = {}) =>
  <P extends any[], R>(queueFn: Fn<P, R>): Fn<P, R extends Promise<any> ? R : Promise<R>> => {
    const initialOptions = { ...options }
    const queued: Task[] = []
    let queueOuterFn: Fn<[Fn<any, any>], any>
    let id: any
    let last: any
    let runs = false

    if (options.hooks) {
      if (options.hooks.before || options.hooks.after) {
        const real = queueFn
        queueFn = function queueFn(this: any, ...args: P) {
          options.hooks!.before?.()
          const result = real.apply(this, args)
          options.hooks!.after?.()
          return result
        }
      }
    }

    if (options.raf) queueOuterFn = requestAnimationFrame
    else if (options.task) queueOuterFn = queueMicrotask
    else if (options.time) queueOuterFn = setTimeout
    else if (options.throttle != null) {
      queueOuterFn = fn => {
        runs = true
        setTimeout(() => {
          if (!queued.length) runs = false
          fn()
        }, options.throttle)
      }
    } else if (options.debounce != null) {
      queueOuterFn = fn => {
        clearTimeout(id)
        id = setTimeout(fn, options.debounce)
      }
    } else if (options.atomic)
      queueOuterFn = fn => fn()
    else {
      // No queue function provided, return identity.
      // This is used when extending this in `event`.
      Object.assign(queueFn, {
        fn: queueFn,
        update: () => queueFn
      })
      return queueFn as any
    }

    if (options.first == null && options.last == null) {
      if (options.throttle != null) {
        options.first = true
        options.last = true
      }
      else if (options.debounce != null)
        options.last = true
      else
        options.next = true
    }

    let runningTasks = 0

    function queueNext() {
      let task: Task

      if (queued.length) {
        if (options.atomic) {
          task = queued.shift()!
          taskRun(task)
            .catch((_error: Error) => {
              //!warn _error
            })
            .finally(() => {
              if (options.concurrency) {
                runningTasks--
              }
              queueOuterFn(queueNext)
            })
          if (options.concurrency) {
            runningTasks++
            if (runningTasks < options.concurrency) {
              queueOuterFn(queueNext)
            }
          }
          return
        }
        if (options.last) {
          if (options.next) {
            const left = queued.splice(0, queued.length - 1)
            task = left.pop() ?? queued.pop()!
            taskGroup(task, left)
            last = taskRun(task)
            if (queued.length || options.throttle) {
              queueOuterFn(queueNext)
            }
            return
          } else {
            task = queued.pop()!
            taskGroup(task, queued.splice(0))
            last = taskRun(task)
            if (options.throttle) {
              queueOuterFn(queueNext)
              return
            }
          }
        } else if (options.next) {
          task = queued.shift()!
          taskGroup(task, queued.splice(0, queued.length - 1))
          queueOuterFn(queueNext)
          last = taskRun(task)
          return
        } else {
          task = Task()
          taskGroup(task, queued.splice(0))
          task.resolve(last)
        }
      }
      runs = false
    }

    function queueWrap(this: any, ...args: P) {
      //!? 'wrap called'
      const task = Task(queueFn, this, args)

      if (!runs && options.first) {
        runs = true
        if (!queued.length) {
          last = taskRun(task)
          queueOuterFn(queueNext)
          return task.promise
        }
      }

      queued.push(task)

      if (!runs || options.debounce) {
        runs = true
        queueOuterFn(queueNext)
      }

      return task.promise
    }

    queueWrap.fn = queueFn
    queueWrap.options = initialOptions

    queueWrap.update = (newFn: Fn<P, R>, newOptions: QueueOptions) => {
      //!? 'updating fn'
      if (!shallowEqual(initialOptions, newOptions)) {
        //!? 'new options', initialOptions, newOptions
        return newFn
      }
      queueFn = newFn
      //!? 'updated and returned previous wrapped'
      return queueWrap
    }

    return queueWrap as any
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
