import wait from 'wait'
import { ChainController } from './ChainController'
import { DateTime } from 'luxon'
import { DbController } from './DbController'
import { formatUnits } from 'ethers/lib/utils'
import { getBlockNumberFromDate } from './utils/getBlockNumberFromDate'
import { pollIntervalSeconds } from './config'

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
    return this.dbController.getNearestGasFeeData({ chainSlug, timestamp })
  }

  async startPoller (options: any = {}) {
    const { syncStartTimestamp } = options
    while (true) {
      let isFirstPoll = true
      try {
        console.log('poll')
        for (const chainSlug in this.chainControllers) {
          try {
            const chainController = this.chainControllers[chainSlug]
            console.log('fetching chain', chainSlug)

            let customStartSyncBlock: any = null
            if (syncStartTimestamp && isFirstPoll) {
              customStartSyncBlock = await getBlockNumberFromDate(chainController.provider, syncStartTimestamp)
            }

            const syncKey = `${chainSlug}`
            let lastSyncedBlocked: any = null
            try {
              if (customStartSyncBlock) {
                lastSyncedBlocked = customStartSyncBlock
              } else {
                lastSyncedBlocked = await this.dbController.getSyncState(syncKey)
              }
            } catch (err: any) {
            }
            const endBlockNumber = (await chainController.getBlockNumber() - 1)
            const startBlockNumber = lastSyncedBlocked ? Number(lastSyncedBlocked) : endBlockNumber - 1
            if (startBlockNumber === endBlockNumber || startBlockNumber > endBlockNumber) {
              continue
            }

            console.log('chain', chainSlug, 'startBlockNumber', startBlockNumber, 'endBlockNumber', endBlockNumber, 'diff', endBlockNumber - startBlockNumber)
            let lastTimestamp = 0
            for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
              if (lastTimestamp) {
                const exists = await this.dbController.getGasFeeData({ chainSlug, timestamp: lastTimestamp })
                if (exists) {
                  continue
                }
              }

              const exists = await this.dbController.getGasFeeData({ chainSlug, blockNumber })
              if (exists) {
                continue
              }

              const feeData = await chainController.getFeeData(blockNumber)
              const timestamp = feeData.timestamp
              const relativeTime = DateTime.fromSeconds(timestamp).toRelative()
              const gwei = formatUnits(feeData.feeData.baseFeePerGas, 9)
              console.log('storing', chainSlug, 'blockNumber', blockNumber, 'gwei', gwei, 'timestamp', timestamp, 'relativeTime', relativeTime)
              await this.dbController.putGasFeeData({
                chainSlug,
                blockNumber,
                timestamp,
                feeData
              })
              await this.dbController.putSyncState(syncKey, endBlockNumber)
              lastTimestamp = timestamp
            }
          } catch (err: any) {
            console.error(`error fetching chain ${chainSlug}`, err)
          }
        }
      } catch (err: any) {
        console.error('poll error', err)
      }
      isFirstPoll = false

      await wait(pollIntervalSeconds * 1000)
    }
  }

  close () {
    this.dbController.close()
  }
}
