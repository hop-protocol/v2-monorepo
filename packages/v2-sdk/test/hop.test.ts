import pkg from '../package.json'
import { Hop } from '../src/index'

describe('sdk setup', () => {
  it('should return version', () => {
    const hop = new Hop()
    expect(hop.version).toBe(pkg.version)
  })
  it.only('getBundleCommittedEvents', async () => {
    const hop = new Hop('goerli')
    const chain = 'optimism'
    const endBlock = await hop.providers[chain].getBlockNumber()
    const startBlock = endBlock - 100
    const events = await hop.getBundleCommittedEvents(chain, startBlock, endBlock)
    expect(events).toStrictEqual([])
  }, 60 * 1000)
})
