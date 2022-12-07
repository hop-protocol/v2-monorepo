import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from '../indexer'

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
        const fromChainId = 420
        const endBlock = 3218900
        const startBlock = endBlock - 100
        const [bundleCommittedEvent] = await this.hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
        const shouldAttempt = await this.hop.shouldAttemptForwardMessage(fromChainId, bundleCommittedEvent)
        console.log('shouldAttempt:', shouldAttempt)
        if (shouldAttempt) {
          const txData = await this.hop.getBundleExitPopulatedTx(fromChainId, bundleCommittedEvent)
          console.log(txData)
        }
      } catch (err: any) {
        console.error(err)
      }

      await wait(this.pollIntervalMs)
    }
  }
}
