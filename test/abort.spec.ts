import { abort } from '../src/abort'

describe('abort', () => {
  it('latest', async () => {
    let times = 0
    const results: any = []
    const fn = abort.latest(
      signal =>
        async (x: number) => {
          times++
          await new Promise(resolve => setTimeout(resolve, 100))
          if (signal.aborted) return
          results.push(x)
        }
    )
    fn(1)
    fn(2)
    await fn(3)
    expect(times).toBe(3)
    expect(results).toMatchSnapshot()
  })

  it('times out', async () => {
    let times = 0
    const results: any = []
    const fn = abort.latest.timeout(200).throw(
      signal =>
        async (x: number) => {
          times++
          await new Promise(resolve => setTimeout(resolve, 300))
          if (signal.aborted) return
          results.push(x)
        }
    )
    await expect(Promise.race([fn(1), fn(2), fn(3)])).rejects.toThrow('Timed out')
    expect(times).toBe(3)
    expect(results).toMatchSnapshot()
  })
})
