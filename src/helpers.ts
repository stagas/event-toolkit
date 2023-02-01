export type AnyFn = ((...args: any[]) => any) | void | false

export function chain(rest: AnyFn[] | AnyFn[][]): () => any
export function chain(...rest: AnyFn[]): () => any
export function chain(first: AnyFn | AnyFn[] | AnyFn[][], ...rest: AnyFn[]) {
  if (Array.isArray(first)) {
    ;[first, ...rest] = first.flat().filter(Boolean)
    if (first == null) return () => { }
  }
  rest = rest.filter(Boolean)
  return (...args: any[]) => {
    ; (first as any)?.(...args)
    for (const fn of rest) (fn as any)(...args)
  }
}

export const onAll = (target: EventTarget, listener: EventListener, ...args: any[]) => {
  const targetOwnDispatch = target.dispatchEvent
  const events = new Set<string>()
  target.dispatchEvent = function (event: Event) {
    if (!events.has(event.type)) {
      target.addEventListener(event.type, listener, ...args)
      events.add(event.type)
    }
    return targetOwnDispatch.call(this, event)
  }
  return () => {
    for (const eventType of events) {
      target.removeEventListener(eventType, listener, ...args)
    }
    events.clear()
    target.dispatchEvent = targetOwnDispatch
  }
}
