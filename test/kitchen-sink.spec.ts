// @env browser
// @env jsdom
import { event, on } from '../src'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
let rx = 0
Math.random = () => Math.sin(++rx * 1000) / 2 + 0.5

describe('kitchen sink', () => {
  describe('event', () => {
    it('event.raf', async () => {
      const btn = document.createElement('button')
      let clicked = 0
      btn.onclick = event.raf(_e => clicked++) as any
      btn.click()
      btn.click()
      btn.click()
      expect(clicked).toBe(0)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(1)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
    })

    it('event.raf.first.last.next', async () => {
      const btn = document.createElement('button')
      let clicked = 0
      btn.onclick = event.raf.first.last.next(() => clicked++) as any
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      expect(clicked).toBe(1)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(3)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(3)
    })
  })

  describe('on', () => {
    it('on(btn).raf', async () => {
      const btn = document.createElement('button')
      let clicked = 0
      on(btn).click.raf(_e => clicked++)
      btn.click()
      btn.click()
      btn.click()
      expect(clicked).toBe(0)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(1)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
    })

    it('on(btn).raf.first.last.next', async () => {
      const btn = document.createElement('button')
      let clicked = 0
      on(btn).click.raf.first.last.next(() => clicked++)
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      expect(clicked).toBe(1)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(2)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(3)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(clicked).toBe(3)
    })

    it('on(btn).debounce()', async () => {
      const btn = document.createElement('button')
      let count = 0
      on(btn).click.debounce(5)(() => count++)
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      expect(count).toBe(0)
      await wait(6)
      expect(count).toBe(1)
      await wait(6)
      expect(count).toBe(1)
    })

    it('on(btn).atomic()', async () => {
      const btn = document.createElement('button')
      const results: any = []
      let i = 0
      on(btn).click.atomic(async () => {
        const res = ++i
        await wait(Math.random() * 10)
        results.push(res)
      })
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      await wait(100)
      expect(i).toBe(5)
      expect(results).toMatchSnapshot()
    })

    it('on(btn).atomic.throttle()', async () => {
      const btn = document.createElement('button')
      const results: any = []
      let i = 0
      on(btn).click.atomic.throttle(40)(async () => {
        const res = ++i
        await wait(Math.random() * 8)
        results.push(res)
      })
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      await wait(100)
      expect(i).toBe(3)
      expect(results).toMatchSnapshot()
    })

    it('on(btn).atomic.debounce()', async () => {
      const btn = document.createElement('button')
      const results: any = []
      let i = 0
      on(btn).click.atomic.debounce(40)(async () => {
        const res = ++i
        await wait(Math.random() * 8)
        results.push(res)
      })
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      btn.click()
      await wait(60)
      expect(i).toBe(1)
      expect(results).toMatchSnapshot()
      btn.click()
      await wait(50)
      expect(i).toBe(2)
      expect(results).toMatchSnapshot()
    })
  })
})
