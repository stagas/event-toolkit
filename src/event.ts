import { EventHandler, Target } from 'everyday-types'
import { bool, toFluent } from 'to-fluent'
import { QueueOptions, wrapQueue } from './queue'

export class EventOptions extends QueueOptions {
  prevent = bool
  stop = bool
  immediate = bool
}

export const wrapEvent = (options: EventOptions) =>
  <T extends Target, E extends Event>(fn: EventHandler<T, E> = () => {}) =>
    wrapQueue(options)(
      options.prevent || options.stop || options.immediate
        ? function(this: T, e: E) {
          if (options.prevent) e.preventDefault()
          if (options.stop) {
            options.immediate
              ? e.stopImmediatePropagation()
              : e.stopPropagation()
          }
          return fn.call(this, e as any)
        }
        : fn
    )

/**
 * Decorates event handler `fn`.
 *
 * Options:
 * - `prevent` => `event.preventDefault()`
 * - `stop` => `event.stopPropagation()`
 * - `stop.immediate` => `event.stopImmediatePropagation()`
 *
 * Options inherited from `queue`:
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
 * btn.onclick = event(fn)
 * btn.onclick = event.prevent(fn)
 * btn.onclick = event.prevent.stop(fn)
 * btn.onclick = event.stop.immediate(fn)
 *
 * // examples with queue
 * btn.onclick = event.stop.raf(fn)
 * btn.onclick = event.prevent.throttle(50)(fn)
 * btn.onclick = event.debounce(100)(fn)
 * ```
 */
export const event = toFluent(EventOptions, wrapEvent)
