import { BigNumber } from 'ethers'
import { BundleCommittedEventsDb } from '../src/db/BundleCommittedEventsDb'

const dbPath = '/tmp/testdb'

describe('BundleCommittedEventsDb', () => {
  it('should put, get, and update data', async () => {
    const db = new BundleCommittedEventsDb(dbPath)

    const data = {
      bundleId: '123',
      bundleRoot: '0x123',
      bundleFees: BigNumber.from(123),
      toChainId: 1,
      commitTime: 1000000000,
      context: {
        chainSlug: 'abc',
        chainId: 1,
        transactionHash: '0x456',
        transactionIndex: 0,
        logIndex: 0,
        blockNumber: 1000,
        blockTimestamp: 1000000000
      }
    }

    await db.put(data.bundleId, data)
    expect(await db.get(data.bundleId)).toStrictEqual(data)

    const updatedData = Object.assign({}, data, {
      toChainId: 2
    })

    await db.update(data.bundleId, { toChainId: 2 })

    expect(await db.get(data.bundleId)).toStrictEqual(updatedData)
  }, 60 * 1000)
})
