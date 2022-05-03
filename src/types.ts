export type Fn<T extends unknown[], R> = (...args: T) => R

/** Target element. */
export type Target = HTMLElement | SVGElement | Window | Document | ShadowRoot

export type TargetEventMap<T> = T extends ShadowRoot ? ShadowRootEventMap
  : T extends Document ? DocumentEventMap
  : T extends Window ? WindowEventMap
  : T extends SVGElement ? SVGElementEventMap
  : T extends HTMLElement ? HTMLElementEventMap
  : GlobalEventHandlersEventMap

// export type EventMap<T> = T extends keyof ShadowRootEventMap ? ShadowRootEventMap
//   : T extends keyof DocumentEventMap ? DocumentEventMap
//   : T extends keyof WindowEventMap ? WindowEventMap
//   : T extends keyof SVGElementEventMap ? SVGElementEventMap
//   : T extends keyof HTMLElementEventMap ? HTMLElementEventMap
//   : GlobalEventHandlersEventMap
