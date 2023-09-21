import mcache from 'memory-cache'
import wait from 'wait'
import { pollIntervalSeconds } from './config'
import { ChainController } from './ChainController'
import { DbController } from './DbController'

const cache = new mcache.Cache()

export class Controller {
  chainControllers: Record<string, ChainController>
  dbController: DbController

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      basezk: new ChainController('basezk'),
    }

    this.dbController = new DbController()
  }

  async getFeeData (input: any) {
    const { chainSlug, timestamp } = input
    return this.dbController.getGasFeeData({ chainSlug, timestamp })
  }

  async startPoller () {
    while (true) {
      try {
        console.log('poll')
        for (const chainSlug in this.chainControllers) {
          const chainController = this.chainControllers[chainSlug]
          const feeData = await chainController.getCurrentFeeData()
          this.dbController.putGasFeeData({
            chainSlug,
            timestamp: feeData.timestamp,
            feeData
          })
        }
      } catch (err: any) {
        console.error('poll error', err)
      }

      await wait(pollIntervalSeconds * 1000)
    }
  }
}
