import { inspectWithPreamble, setOptions } from '@n1kk/intspector'
import { EventHandler } from 'everyday-types'
import { on } from '../src/on'
setOptions(require('../tsconfig.json'), true)

let x = 0

describe('off = on(el).<event>(cb)', () => {
  it('adds an event listener', () => {
    const btn = document.createElement('button')
    let clicked = 0
    on(btn).click(e => {
      e.timeStamp, e.currentTarget, clicked++
    })
    btn.click()
    expect(clicked).toBe(1)
    btn.click()
    expect(clicked).toBe(2)
  })

  it('correct type', () => {
    const btn = document.createElement('button')
    let clicked = 0
    const listener: EventHandler<HTMLButtonElement, MouseEvent> = _e => clicked++
    on(btn).click(listener)
    btn.click()
    expect(clicked).toBe(1)
    btn.click()
    expect(clicked).toBe(2)
  })

  it('can add using string', () => {
    const btn = document.createElement('button')
    let clicked = 0
    on(btn, 'click')(e => {
      e.button, e.timeStamp, e.currentTarget, clicked++
    })
    btn.click()
    expect(clicked).toBe(1)
    btn.click()
    expect(clicked).toBe(2)
  })

  it('type test', () => {
    const { result } = inspectWithPreamble(`
      import { on } from '../src/on'
      const btn = document.createElement('button')
      let event: MouseEvent
      on(btn).click(e => event = e)
    `)({ result: 'typeof event' })

    expect(result).toEqual('MouseEvent')
  })

  it('accepts options', () => {
    const btn = document.createElement('button')
    let clicked = 0
    on(btn).click.once(_e => clicked++)
    btn.click()
    expect(clicked).toBe(1)
    btn.click()
    expect(clicked).toBe(1)
  })

  it('returns the off listener', () => {
    const btn = document.createElement('button')
    let clicked = 0
    const off = on(btn).click(_e => clicked++)
    btn.click()
    expect(clicked).toBe(1)
    off()
    btn.click()
    expect(clicked).toBe(1)
  })

  it('off runs its callback', async () => {
    const btn = document.createElement('button')
    let clicked = 0
    const off = on(btn).click(_e => clicked++)
    btn.click()
    expect(clicked).toBe(1)
    const p = off()
    btn.click()
    expect(clicked).toBe(1)
    let offCallback = 0
    await p.then(() => offCallback++).then(() => offCallback++)
    expect(offCallback).toBe(2)
  })

  it('detects custom event listeners', () => {
    class El extends HTMLElement {
      onfoo?(ev: CustomEvent<{ some: string }>): void
      hello() {}
    }

    customElements.define(`x-el${x++}`, El)

    const el = new El()
    let result = 'hello'
    on(el).foo(({ detail: { some } }) => {
      result += some
    })
    el.dispatchEvent(new CustomEvent('foo', { detail: { some: 'world' } }))
    expect(result).toBe('helloworld')
  })

  it('applies modifiers on event handler', () => {
    const btn = document.createElement('button')
    let clicked = 0
    let ev: MouseEvent
    on(btn).click.prevent(e => {
      clicked++, ev = e
    })
    btn.click()
    expect(clicked).toBe(1)
    expect(ev!.defaultPrevented).toBe(true)
  })
})
