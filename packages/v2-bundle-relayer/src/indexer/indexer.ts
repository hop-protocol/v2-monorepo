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

  async syncBundleCommittedEvents () {
    const syncState = await db.bundleCommittedEventsDb.getSyncState()
    console.log('syncState', syncState)

    const fromChainId = 420
    const provider = this.hop.providers.optimism
    let startBlock = _startBlock
    let endBlock = _startBlock + 1000 // await provider.getBlockNumber()
    if (syncState?.endBlock) {
      startBlock = syncState.endBlock + 1
      endBlock = startBlock + 1000 // await provider.getBlockNumber()
    }

    console.log('syncBundleCommittedEvents', fromChainId, startBlock, endBlock)

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
  }

  async syncer () {
    console.log('syncer start')

    await this.syncBundleCommittedEvents()

    console.log('syncer done')
  }
}
