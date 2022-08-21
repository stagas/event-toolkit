// @env browser
// @env jsdom
import { dispatch } from '../src/dispatch'

let x = 0

describe('dispatch', () => {
  it('adds an event listener', () => {
    const btn = document.createElement('button')
    dispatch.bubbles(btn, 'click')
  })

  it('detects custom event listeners', () => {
    class El extends HTMLElement {
      onfoo?(ev: CustomEvent<{ some: string }>): void
      hello() {}
    }

    customElements.define(`x-el${x++}`, El)

    const el = new El()
    el.onfoo = _e => {}
    // let result = 'hello'
    // on(el).foo(({ detail: { some } }) => {
    //   result += some
    // })
    dispatch(el, 'foo', { some: 'string' })
    // expect(result).toBe('helloworld')
  })
})
