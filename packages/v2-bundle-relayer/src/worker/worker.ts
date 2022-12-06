import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'

export class Worker {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000

  constructor () {
    const hop = new Hop('goerli')
    this.hop = hop
  }

  async start () {
    await this.poll()
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
