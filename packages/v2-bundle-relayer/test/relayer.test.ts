import pkg from '../package.json'
import { Relayer } from '../src/index'

describe('relayer setup', () => {
  const relayer = new Relayer()
  it('should return version', () => {
    expect(relayer.version).toBe(pkg.version)
  })
})
