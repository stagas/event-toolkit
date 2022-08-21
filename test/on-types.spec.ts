// @env node
import { inspectWithPreamble, setOptions } from '@n1kk/intspector'
setOptions(require('../tsconfig.json'), true)

describe('types off = on(el).<event>(cb)', () => {
  it('type test', () => {
    const { result } = inspectWithPreamble(`
      import { on } from '../src/on'
      const btn = document.createElement('button')
      let event: MouseEvent
      on(btn).click(e => event = e)
    `)({ result: 'typeof event' })

    expect(result).toEqual('MouseEvent')
  })
})
