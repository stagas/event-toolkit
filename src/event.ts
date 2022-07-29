import { EventHandler, Target } from 'everyday-types'
import { bool, toFluent } from 'to-fluent'
import { QueueOptions, wrapQueue } from './queue'

export type { EventHandler }

export class EventOptions extends QueueOptions {
  prevent = bool
  stop = bool
  immediate = bool
  capture = bool
  once = bool
  passive = bool
}

export const wrapEvent = (options: EventOptions = {} as EventOptions) =>
  <T extends Target, E extends Event>(fn: EventHandler<T, E> = () => {}) =>
    wrapQueue(options)(
      options.prevent
        || options.stop
        || options.immediate
        || (options.capture != null)
        || (options.once != null)
        || (options.passive != null)
        ? Object.assign(function(this: T, e: E) {
          if (options.prevent) e.preventDefault()
          if (options.stop) {
            options.immediate
              ? e.stopImmediatePropagation()
              : e.stopPropagation()
          }
          return fn.call(this, e as any)
        }, options)
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
 * Listener options:
 * - `capture` => If specified, indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.
 * - `once` => If specified, indicates that the listener should be invoked at most once after being added. The listener would be automatically removed when invoked.
 * - `passive` => Indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning. If not specified, defaults to `not.passive` – except that in browsers other than Safari and Internet Explorer, defaults to `passive` for the `wheel`, `mousewheel`, `touchstart` and `touchmove` events.
 *
 * Queue options:
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
