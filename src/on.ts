import type { EventHandler, EventKeys, EventsOf, Fn, StringOf } from 'everyday-types'
import { Getter } from 'proxy-toolkit'
import { bool, Fluent, toFluent } from 'to-fluent'
import { EventOptions, wrapEvent } from './event'

/**
 * Removes the event listener and returns a promise used for chaining.
 * @public
 */
export type Off = () => Promise<void>
export type On<T> = T & Fluent<T, Required<OnOptions>>
export type OnEvent<T, K extends EventKeys<T>> = On<Fn<[EventHandler<T, EventsOf<T>[K]>?], Off>>
export type OnGetter<T> = { [K in EventKeys<T>]: OnEvent<T, K> }

export class OnOptions extends EventOptions implements AddEventListenerOptions {
  once = bool
  passive = bool
  capture = bool
}

const onEvent = (el: EventTarget, type: string, listener: EventHandler<any, any>, options: AddEventListenerOptions) => {
  el.addEventListener(type, listener, options)
  return () => Promise.resolve(el.removeEventListener(type, listener, options))
}

const onEventFluent = (el: EventTarget, key: string) =>
  toFluent(OnOptions, options => (listener = () => {}) => onEvent(el, key, wrapEvent(options)(listener), options))

/**
 * Adds an event listener for `el` using fluent options.
 *
 * Options:
 * - `capture` => If specified, indicates that events of this type will be dispatched to the registered listener before being dispatched to any `EventTarget` beneath it in the DOM tree.
 * - `once` => If specified, indicates that the listener should be invoked at most once after being added. The listener would be automatically removed when invoked.
 * - `passive` => Indicates that the function specified by listener will never call `preventDefault()`. If a passive listener does call `preventDefault()`, the user agent will do nothing other than generate a console warning. If not specified, defaults to `not.passive` – except that in browsers other than Safari and Internet Explorer, defaults to `passive` for the `wheel`, `mousewheel`, `touchstart` and `touchmove` events.
 * - `signal(ctrl.signal)` => An `AbortSignal`. The listener will be removed when the given `AbortSignal` object's `abort()` method is called. If not specified, no `AbortSignal` is associated with the listener.
 *
 * Options inherited from `event`:
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
 * on(btn).click(e => console.log('clicked'))
 * on(btn).click.once(e => console.log('clicked once'))
 * on(btn).wheel.not.passive(e => console.log('wheel not passive'))
 *
 * const off = on(btn).pointerdown.capture(e => console.log('pointer down'))
 * off() // removes the listener
 *
 * const offPointerMove = on(window).pointermove(e => console.log('pointer move'))
 * const offPointerUp = on(window).pointerup(e => console.log('pointer up'))
 * offPointerUp(offPointerMove) // remove both listeners shortcut syntax
 *
 * const ctrl = new AbortController()
 * on(window).pointermove.signal(ctrl.signal)(e =>
 *   console.log('runs until aborted'))
 * ctrl.abort() // removes the listener by signaling abort
 *
 * on(btn).click.prevent(e => console.log('prevented default'))
 * ```
 *
 * @public
 */

export function on<T extends EventTarget>(el: T): OnGetter<T>
export function on<T extends EventTarget, K extends EventKeys<T>>(el: T, key: K): OnEvent<T, K>
export function on<T extends EventTarget, K extends EventKeys<T>>(el: T, key?: StringOf<K>) {
  return key != null
    ? onEventFluent(el, key)
    : Getter(key => onEventFluent(el, key))
}
