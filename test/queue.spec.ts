import { queue } from '../src/queue'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('queue(fn)', () => {
  describe('task', () => {
    it('one', async () => {
      let count = 0
      const cb = queue.task((x: number) => count += x)
      cb(1)
      expect(count).toEqual(0)
      await Promise.resolve()
      expect(count).toEqual(1)
    })

    it('multiple', async () => {
      let count = 0
      const cb = queue.task((x: number) => count += x)
      cb(1) // passes (after task)
      cb(2) // discarded
      cb(3) // discarded
      cb(4) // passes
      expect(count).toEqual(0)
      await Promise.resolve()
      expect(count).toEqual(1)
      await Promise.resolve()
      expect(count).toEqual(5)
    })

    it('last', async () => {
      let count = 0
      const cb = queue.task.last((x: number) => count += x)
      cb(1) // discarded
      cb(2) // discarded
      cb(3) // discarded
      cb(4) // passes
      expect(count).toEqual(0)
      await Promise.resolve()
      expect(count).toEqual(4)
    })

    it('first', async () => {
      let count = 0
      const cb = queue.task.first((x: number) => count += x)
      cb(1) // passes (before task)
      cb(2) // discarded
      cb(3) // discarded
      cb(4) // discarded
      expect(count).toEqual(1)
      await Promise.resolve()
      expect(count).toEqual(1)
      await Promise.resolve()
      expect(count).toEqual(1)
    })

    it('first.last', async () => {
      let count = 0
      const cb = queue.task.first.last((x: number) => count += x)
      cb(1) // passes (before task)
      cb(2) // discarded
      cb(3) // discarded
      cb(4) // passes
      expect(count).toEqual(1)
      await Promise.resolve()
      expect(count).toEqual(5)
      await Promise.resolve()
      expect(count).toEqual(5)
    })

    it('first.last', async () => {
      let count = 0
      const cb = queue.task.first.last.next((x: number) => count += x)
      cb(1) // passes (before task)
      cb(2) // discarded
      cb(3) // passes (after task)
      cb(4) // passes (next task)
      expect(count).toEqual(1)
      await Promise.resolve()
      expect(count).toEqual(4)
      await Promise.resolve()
      expect(count).toEqual(8)
    })

    it('last.next', async () => {
      let count = 0
      const cb = queue.task.last.next((x: number) => count += x)
      cb(1) // discarded
      cb(2) // discarded
      cb(3) // passes (after task)
      cb(4) // passes (next task)
      expect(count).toEqual(0)
      await Promise.resolve()
      expect(count).toEqual(3)
      await Promise.resolve()
      expect(count).toEqual(7)
    })
  })

  describe('raf', () => {
    it('one', async () => {
      let count = 0
      const cb = queue.raf(() => count++)
      cb()
      expect(count).toEqual(0)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(count).toEqual(1)
    })

    it('two', async () => {
      let count = 0
      const cb = queue.raf(() => count++)
      cb()
      cb()
      expect(count).toEqual(0)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(count).toEqual(1)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(count).toEqual(2)
    })

    it('multiple plain', async () => {
      let count = 0
      const cb = queue.raf(() => count++)
      cb()
      cb()
      cb()
      cb()
      expect(count).toEqual(0)
      const results: any = []
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          results.push(count)
          requestAnimationFrame(resolve)
        })
      })
      results.push(count)
      expect(count).toEqual(2)
      expect(results).toMatchSnapshot()
    })

    it('multiple with args', async () => {
      let value: any
      let count = 0
      const cb = queue.raf((x: number) => {
        count++
        value = x
        return x
      })
      cb(1)
      cb(2)
      cb(3)
      cb(4)
      expect(value).toBeUndefined()
      const results: any = []
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          results.push(value)
          requestAnimationFrame(resolve)
        })
      })
      results.push(value)
      expect(count).toBe(2)
      expect(value).toBe(4)
      expect(results).toMatchSnapshot()
    })

    it('resolves with result', async () => {
      let value: any
      let count = 0
      const cb = queue.raf((x: number) => {
        value = x
        count++
        return x
      })
      const p1 = cb(1)
      const p2 = cb(2)
      const p3 = cb(3)
      const result = await cb(4)
      expect(value).toBe(4)
      expect(result).toBe(4)
      expect(await p1).toBe(1)
      expect(await p2).toBe(1)
      expect(await p3).toBe(1)
      expect(count).toBe(2)
    })
  })

  describe('time', () => {
    it('time', async () => {
      let count = 0
      const cb = queue.time(() => count++)
      cb()
      expect(count).toEqual(0)
      await new Promise(resolve => setTimeout(resolve))
      expect(count).toEqual(1)
    })
  })

  describe('throttle', () => {
    it('first === thottle', async () => {
      let count = 0
      const cb = queue.throttle(10)((x: number) => count += x)
      cb(2) // passes
      cb(3) // discarded
      cb(4) // discarded
      expect(count).toEqual(2)
      await wait(11)
      expect(count).toEqual(2)
    })

    it('first.last', async () => {
      let count = 0
      const cb = queue.throttle(10).first.last((x: number) => count += x)
      cb(2) // passes
      cb(3) // discarded
      cb(4) // passes
      expect(count).toEqual(2)
      await wait(11)
      expect(count).toEqual(6)
    })
  })

  describe('debounce', () => {
    it('debounce() = last', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5)((x: number) => count += x)
      p.push(cb(2)) // discarded
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // discarded
      p.push(cb(6)) // passes(last)
      expect(count).toBe(0)
      await wait(6)
      expect(count).toBe(6)
      await wait(6)
      expect(count).toBe(6)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(6)
    })

    it('first()', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5).first((x: number) => (count += x))
      p.push(cb(2)) // passes (first)
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // discarded
      expect(count).toBe(2)
      await wait(6)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(2)
      cb(2)
      expect(count).toBe(4)
    })

    it('first.last()', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5).first.last((x: number) => (count += x))
      p.push(cb(2)) // passes (first)
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // discarded
      p.push(cb(6)) // passes (last)
      expect(count).toBe(2)
      await wait(6)
      expect(count).toBe(8)
      await wait(6)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(8)
    })

    it('first.last.next()', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5).first.last.next((x: number) => (count += x))
      p.push(cb(2)) // passes (first)
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // passes
      p.push(cb(6)) // passes (next quantum)
      expect(count).toBe(2)
      await wait(6)
      expect(count).toBe(7)
      await wait(6)
      expect(count).toBe(13)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(13)
    })

    it('last.next() simple', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5).last.next((x: number) => (count += x))
      p.push(cb(2)) // discarded
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // passes
      p.push(cb(6)) // passes (next quantum)
      expect(count).toBe(0)
      await wait(6)
      expect(count).toBe(5)
      await wait(6)
      expect(count).toBe(11)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(11)
    })

    it('last.next() with additional', async () => {
      let count = 0
      const p = []
      const cb = queue.debounce(5).last.next((x: number) => (count += x))
      p.push(cb(2)) // discarded
      p.push(cb(3)) // discarded
      p.push(cb(4)) // discarded
      p.push(cb(5)) // passes
      p.push(cb(6)) // passes but is discarded by next
      expect(count).toBe(0)
      await wait(5)
      expect(count).toBe(5)
      p.push(cb(7)) // discards 6
      p.push(cb(8)) // passes (last)
      p.push(cb(9)) // passes (next quantum)
      await wait(5)
      expect(count).toBe(13)
      await wait(5)
      expect(count).toBe(22)
      expect(await Promise.all(p)).toMatchSnapshot()
      expect(count).toBe(22)
    })
  })
})
