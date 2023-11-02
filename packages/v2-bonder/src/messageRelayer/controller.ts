import wait from 'wait'
import { ChainController } from './ChainController'
import { GasPriceOracle } from '../gasPriceOracle'
import { chainIdToSlug } from '../utils/chainIdToSlug'
import { pgDb } from '../pgDb'

export class Controller {
  chainControllers: Record<string, ChainController>
  gasPriceOracle = new GasPriceOracle('goerli')
  pgDb = pgDb

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      base: new ChainController('base')
    }
  }

  async startPoller () {
    while (true) {
      try {
        const events = await this.pgDb.events.MessageSent.getItems() // TODO: get unprocessed items
        console.log('events', events.length)
        for (const event of events) {
          const targetGasCost = '0.0003' // TODO
          const toChainSlug = chainIdToSlug(event.toChainId)
          const timestamp = Math.floor(Date.now() / 1000) // event.blockTimestamp // TODO
          const gasLimit = event.gasLimit
          const txData = event.data
          const response = await this.gasPriceOracle.verifyGasCostEstimate(toChainSlug, timestamp, gasLimit, txData, targetGasCost)
          if (response?.data?.valid) {
            console.log('gas cost estimate is valid')
          } else {
            console.log('gas cost estimate is invalid')
          }
        }
      } catch (err: any) {
        console.error(err)
      }
      await wait(10 * 1000)
    }
  }

  // TODO
  async getQuote (input: any) {
    const { chainSlug } = input

    return {
      chainSlug
    }
  }
}
