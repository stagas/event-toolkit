import { chain } from '../src/helpers'

describe('chain', () => {
  it('chains promise factories', async () => {
    let res = ''
    await chain(
      () => Promise.resolve(res += 'a'),
      () => Promise.resolve(res += 'b'),
      () => Promise.resolve(res += 'c')
    )()
    expect(res).toBe('abc')
  })
})
