import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { db } from '../db'

const _startBlock = 3218800

export class Indexer {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000

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
    let endBlock = await provider.getBlockNumber()
    if (syncState?.toBlock) {
      startBlock = syncState.toBlock + 1
      endBlock = await provider.getBlockNumber()
    }

    console.log('syncBundleCommittedEvents', fromChainId, startBlock, endBlock)

    const events = await this.hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
    console.log('events', events.length)
    for (const event of events) {
      await db.bundleCommittedEventsDb.updateEvent(event.bundleId, {
        bundleId: event.bundleId,
        bundleRoot: event.bundleRoot,
        bundleFees: event.bundleFees,
        toChainId: event.toChainId,
        commitTime: event.commitTime,
        context: event.context
      })
    }

    await db.bundleCommittedEventsDb.putSyncState({ fromBlock: startBlock, toBlock: endBlock })
  }

  async syncer () {
    while (true) {
      try {
        console.log('syncer start')
        await this.syncBundleCommittedEvents()
        console.log('syncer done')
      } catch (err: any) {
        console.error('syncer error:', err)
      }
      await wait(this.pollIntervalMs)
    }
  }
}
