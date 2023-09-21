import mcache from 'memory-cache'
import wait from 'wait'
import { pollIntervalSeconds } from './config'

const cache = new mcache.Cache()

export class Controller {
  constructor () {
  }

  async getRecommendedGasPrice () {
    return 5
  }

  async pollEvents () {
    while (true) {
      try {
        console.log('poll')
      } catch (err: any) {
        console.error('pollEvents error', err)
      }

      await wait(pollIntervalSeconds * 1000)
    }
  }
}
