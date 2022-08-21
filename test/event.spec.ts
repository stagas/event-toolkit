import { event } from '../src/event'

describe('event(listener)', () => {
  it('constructs an event listener', () => {
    const btn = document.createElement('button')
    let clicked = 0
    btn.onclick = event(_e => clicked++)
    btn.click()
    expect(clicked).toBe(1)
  })

  it('decorates listener', () => {
    let count = 0
    const btn = document.createElement('button')
    btn.onclick = event(() => count++)
    btn.click()
    expect(count).toEqual(1)
  })

  it('prevent', () => {
    let count = 0
    let prevent = 0
    let stop = 0
    const mock = {
      preventDefault() {
        prevent++
      },
      stopPropagation() {
        stop++
      },
    } as Event
    event.prevent(() => count++).call(this as any, mock)
    expect(count).toEqual(1)
    expect(prevent).toEqual(1)
    expect(stop).toEqual(0)
  })

  it('stop', () => {
    let count = 0
    let prevent = 0
    let stop = 0
    const mock = {
      preventDefault() {
        prevent++
      },
      stopPropagation() {
        stop++
      },
    } as Event
    event.stop(() => count++).call(this as any, mock)
    expect(count).toEqual(1)
    expect(prevent).toEqual(0)
    expect(stop).toEqual(1)
  })

  it('stop.immediate', () => {
    let count = 0
    let prevent = 0
    let stop = 0
    const mock = {
      preventDefault() {
        prevent++
      },
      stopImmediatePropagation() {
        stop++
      },
    } as Event
    event.stop.immediate(() => count++).call(this as any, mock)
    expect(count).toEqual(1)
    expect(prevent).toEqual(0)
    expect(stop).toEqual(1)
  })

  it('prevent.stop', () => {
    let count = 0
    let prevent = 0
    let stop = 0
    const mock = {
      preventDefault() {
        prevent++
      },
      stopPropagation() {
        stop++
      },
    } as Event
    event.prevent.stop(() => count++).call(this as any, mock)
    expect(count).toEqual(1)
    expect(prevent).toEqual(1)
    expect(stop).toEqual(1)
  })
})
