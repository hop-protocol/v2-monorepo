import { Hop } from '@hop-protocol/v2-sdk'
import { db } from '../db'

const _startBlock = 3218800

export class Indexer {
  hop: Hop
  constructor () {
    this.hop = new Hop('goerli', {
      batchBlocks: 10_000
    })
  }

  async start () {
    await this.syncer()
  }

  async syncer () {
    console.log('syncer')
    const fromChainId = 420
    const provider = this.hop.providers.optimism
    const startBlock = _startBlock
    const endBlock = _startBlock + 1000 // await provider.getBlockNumber()
    console.log('diff', endBlock - startBlock)

    const rangeItems = await db.bundleCommittedEventsDb.getFromRange({ lt: Math.floor(Date.now() / 1000), gt: Math.floor(Date.now() / 1000) - (604800) })
    console.log('rangeItems', rangeItems)

    const syncState = await db.bundleCommittedEventsDb.getSyncState()
    console.log('syncState', syncState)

    const events = await this.hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
    console.log('events', events.length)
    for (const event of events) {
      await db.bundleCommittedEventsDb.update(event.bundleId, {
        bundleId: event.bundleId,
        bundleRoot: event.bundleRoot,
        bundleFees: event.bundleFees,
        toChainId: event.toChainId,
        commitTime: event.commitTime,
        context: {
          chainSlug: event.context?.chainSlug,
          chainId: event.context?.chainId,
          transactionHash: event.context?.transactionHash,
          transactionIndex: event.context?.transactionIndex,
          logIndex: event.context?.logIndex,
          blockNumber: event.context?.blockNumber,
          blockTimestamp: event.context?.blockTimestamp
        }
      })
    }

    await db.bundleCommittedEventsDb.updateSyncState({ startBlock, endBlock })
    console.log('syncer done')
  }
}
