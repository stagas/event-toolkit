import type { DetailOf, EventKeys, Prefix, StringOf } from 'everyday-types'
import { bool, Fluent, toFluent } from 'to-fluent'

export class DispatchOptions implements CustomEventInit {
  bubbles = bool
  cancelable = bool
  composed = bool
}

export type Dispatch<T> = T & Fluent<T, Required<DispatchOptions>>

const dispatchEvent = (el: any, nameOrEvent: any, detail: any, init: any, options: any) =>
  el.dispatchEvent(
    nameOrEvent instanceof Event
      ? nameOrEvent
      : new CustomEvent(nameOrEvent, { detail, ...init, ...options })
  )

export const dispatch = toFluent(
  DispatchOptions,
  options => (<T extends EventTarget, K extends EventKeys<T>>(
    el: T,
    nameOrEvent: StringOf<K> | Event,
    detail?: DetailOf<T, Prefix<'on', K>>,
    init?: CustomEventInit,
  ) => dispatchEvent(el, nameOrEvent, detail, init, options))
)

export const dispatchBind = <T extends EventTarget>(el: T) =>
  toFluent(
    DispatchOptions,
    options => (<K extends EventKeys<T>>(
      nameOrEvent: StringOf<K> | Event,
      detail?: DetailOf<T, Prefix<'on', K>>,
      init?: CustomEventInit,
    ) => dispatchEvent(el, nameOrEvent, detail, init, options))
  )
