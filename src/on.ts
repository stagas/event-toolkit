import { bool, Fluent, toFluent } from 'to-fluent'
import { String } from 'ts-toolbelt'
import { EventOptions, wrapEvent } from './event'
import { Fn, Target, TargetEventMap } from './types'

export type PrefixOn<T extends string> = `on${T}`
export type Narrow<T, K> = K extends keyof T ? K : never
export type Get<T, K> = T[Narrow<T, K>]
export type StringOf<T> = T extends string ? T : never
export type ToEventFluent<T> = T & Fluent<T, Required<OnOptions>>
export type Keys<T> = keyof { [K in keyof T]: StringOf<K> }
export type SansOnKeys<T> = keyof {
  [K in Keys<T> as String.Split<StringOf<K>, 'on'>[1]]-?: any
}

/**
 * Removes the event listener and returns a promise used for chaining.
 * @public
 */
export type Off = () => Promise<void>

/**
 * Event handler proxy. Returns Off.
 */
export type EventMapProxy<T extends Target> =
  & {
    [K in Keys<T>]: ToEventFluent<
      Fn<[Fn<[Get<TargetEventMap<T>, K>], void>], Off>
    >
  }
  & {
    [K in SansOnKeys<T>]: ToEventFluent<
      Fn<[Get<T, PrefixOn<StringOf<K>>>], Off>
    >
  }

function onEvent<T extends Target, K extends keyof GlobalEventHandlersEventMap>(
  el: T,
  type: K,
  listener: (ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): Off

function onEvent<T extends ShadowRoot, K extends keyof ShadowRootEventMap>(
  el: T,
  type: K,
  listener: (ev: ShadowRootEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): Off

function onEvent<T extends Document, K extends keyof DocumentEventMap>(
  el: T,
  type: K,
  listener: (ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): Off

function onEvent<T extends Window, K extends keyof WindowEventMap>(
  el: T,
  type: K,
  listener: (ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): Off

function onEvent<T extends SVGElement, K extends keyof SVGElementEventMap>(
  el: T,
  type: K,
  listener: (ev: SVGElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): Off

function onEvent<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
  el: T,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  el.addEventListener(type, listener, options)
  return () => Promise.resolve(el.removeEventListener(type, listener, options))
}

export class OnOptions extends EventOptions implements AddEventListenerOptions {
  once = bool
  passive = bool
  capture = bool
}

const onFluent = <T extends Target, K>(el: T, name: K) =>
  toFluent(OnOptions, options => listener => onEvent(el, name as any, wrapEvent(options)(listener), options))

const getProxy = <T extends Target>(el: T) =>
  new Proxy({}, { get: (_, key: string) => onFluent(el, key) }) as EventMapProxy<T>

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
export const on = <T extends Target>(el: T): EventMapProxy<T> => getProxy(el)
