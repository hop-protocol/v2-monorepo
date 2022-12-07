import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from '../indexer'
import { db } from '../db'

export class Worker {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000
  indexer: Indexer

  constructor () {
    this.hop = new Hop('goerli')
    this.indexer = new Indexer()
  }

  async start () {
    try {
      this.indexer.start()
      await this.poll()
    } catch (err: any) {
      console.error('worker poll error', err)
    }
  }

  async poll () {
    while (true) {
      try {
        console.log('poll start')
        const now = Math.floor(Date.now() / 1000)
        // TODO: only return if bundle is not set
        const items = await db.bundleCommittedEventsDb.getFromRange({
          lt: now,
          gt: now - (604800)
        })
        console.log('items', items)

        for (const bundleCommittedEvent of items) {
          const { bundleId } = bundleCommittedEvent
          const { chainId: fromChainId } = bundleCommittedEvent.context
          console.log('checking shouldAttemp for bundle', bundleId)
          const shouldAttempt = await this.hop.shouldAttemptForwardMessage(fromChainId, bundleCommittedEvent)
          console.log('shouldAttempt:', shouldAttempt, bundleId)
          if (shouldAttempt) {
            const txData = await this.hop.getBundleExitPopulatedTx(fromChainId, bundleCommittedEvent)
            console.log('txData', txData)

            // TODO: send tx
            // TODO: mark tx as sent
          }
        }
      } catch (err: any) {
        console.error(err)
      }

      await wait(this.pollIntervalMs)
    }
  }
}
