import wait from 'wait'
import { ChainController } from './ChainController'
import { DbController } from './DbController'

let dbController: DbController

export class Controller {
  chainControllers: Record<string, ChainController>
  dbController: DbController

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      base: new ChainController('base')
    }

    if (!dbController) {
      dbController = new DbController()
    }

    this.dbController = dbController
  }

  async startPoller () {
    while (true) {
      try {
        const chains = ['ethereum', 'optimism', 'arbitrum', 'base']
        for (const chainSlug of chains) {
          const chainController = this.chainControllers[chainSlug]

          const syncKey = `${chainSlug}`
          let lastSyncedBlocked: any = null
          try {
            lastSyncedBlocked = await this.dbController.getSyncState(syncKey)
          } catch (err: any) {
          }

          const endBlockNumber = (await chainController.getBlockNumber() - 1)
          const startBlockNumber = lastSyncedBlocked ? Number(lastSyncedBlocked) : endBlockNumber - 1
          if (startBlockNumber === endBlockNumber || startBlockNumber > endBlockNumber) {
            continue
          }

          for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
            const events = await chainController.getMessageSentEvents(blockNumber)
            for (const event of events) {
              const block = await chainController.provider.getBlock(event.blockNumber)
              await this.dbController.putMessageSentEvent({
                timestamp: Number(block.timestamp.toString()),
                blockNumber: Number(event.blockNumber.toString()),
                messageId: event.args.messageId,
                from: event.args.from,
                toChainId: Number(event.args.toChainId.toString()),
                to: event.args.to,
                data: event.args.data
              })
            }
            await this.dbController.putSyncState(syncKey, endBlockNumber)
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

  close () {
    this.dbController.close()
  }
}
