import { Indexer } from '../src/indexer'

describe('Indexer', () => {
  it('should sync events to db', async () => {
    const dbPath = `/tmp/test/testdb/${Date.now()}`
    const indexer = new Indexer({
      dbPath,
      startBlocks: {
        5: 16117269,
        420: 3218800
      }
    })

    const items = await indexer.db.bundleCommittedEventsDb.getFromRange({ gt: 0 })
    expect(items.length).toBe(0)

    indexer.start()
    await indexer.waitForSyncIndex(1)

    const updatedItems = await indexer.db.bundleCommittedEventsDb.getFromRange({ gt: 0 })
    expect(updatedItems.length).toBeGreaterThan(1)
  }, 10 * 60 * 1000)
})
