import pkg from '../package.json'
import { Hop } from '../src/index'

describe('sdk setup', () => {
  const hop = new Hop()
  it('should return version', () => {
    expect(hop.version).toBe(pkg.version)
  })
})
