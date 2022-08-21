// @env node
import { inspectWithPreamble, setOptions } from '@n1kk/intspector'
setOptions(require('../tsconfig.json'), true)

describe('types event(listener)', () => {
  it('infers type', () => {
    const { result } = inspectWithPreamble(`
      import { event } from '../src/event'
      const btn = document.createElement('button')
      let ev: MouseEvent
      btn.onclick = event(e => ev = e)
      btn.click()
    `)({ result: 'typeof ev' })

    expect(result).toEqual('MouseEvent')
  })
})
