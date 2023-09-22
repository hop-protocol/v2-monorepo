import mcache from 'memory-cache'
import wait from 'wait'
import { ChainController } from './ChainController'
import { DbController } from './DbController'
import { pollIntervalSeconds } from './config'

const cache = new mcache.Cache()

let dbController: DbController

export class Controller {
  chainControllers: Record<string, ChainController>
  dbController: DbController

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      basezk: new ChainController('basezk')
    }

    if (!dbController) {
      dbController = new DbController()
    }

    this.dbController = dbController
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
