import { event, on } from '../src'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('kitchen sink', () => {
  describe('event', () => {
    it('event.raf', async () => {
      const btn = document.createElement('button')
      let clicked = 0
      btn.onclick = event.raf(() => clicked++)
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
      btn.onclick = event.raf.first.last.next(() => clicked++)
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
      on(btn).click.raf(() => clicked++)
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
  })
})
