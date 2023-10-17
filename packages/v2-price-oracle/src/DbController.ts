import nearest from 'nearest-date'
import wait from 'wait'
import { Level } from 'level'
import { dbPath } from './config'

export class DbController {
  rootDb: any
  gasFeeDataByTimestampDb: any
  gasFeeDataByBlockNumberDb: any
  syncStateDb: any
  ready: boolean

  constructor () {
    const rootDb = new Level(dbPath, { valueEncoding: 'json' })
    this.rootDb = rootDb

    const gasFeeDataByTimestampDb = rootDb.sublevel('gas-fee-data-timestamp', { valueEncoding: 'json' })
    this.gasFeeDataByTimestampDb = gasFeeDataByTimestampDb

    const gasFeeDataByBlockNumberDb = rootDb.sublevel('gas-fee-data-block-number', { valueEncoding: 'json' })
    this.gasFeeDataByBlockNumberDb = gasFeeDataByBlockNumberDb

    const syncStateDb = rootDb.sublevel('sync-state')
    this.syncStateDb = syncStateDb

    this.init()
  }

  async init () {
    await this.rootDb.open()
    this.ready = true

    this.startPrunePoller()

    process.once('uncaughtException', async () => {
      this.rootDb.close()
      process.exit(0)
    })
  }

  protected async tilReady (): Promise<boolean> {
    if (this.ready) {
      return true
    }

    await wait(100)
    return await this.tilReady()
  }

  async putGasFeeData (input: any) {
    await this.tilReady()
    const { chainSlug, timestamp, blockNumber, feeData } = input
    const key1 = `${chainSlug}-${timestamp}`
    await this.gasFeeDataByTimestampDb.put(key1, {
      chainSlug,
      timestamp,
      blockNumber,
      ...feeData
    })

    const key2 = `${chainSlug}-${blockNumber}`
    await this.gasFeeDataByBlockNumberDb.put(key2, {
      chainSlug,
      timestamp,
      blockNumber,
      ...feeData
    })
  }

  async getGasFeeDataItems (): Promise<any> {
    await this.tilReady()
    const filter = {
      limit: 100
    }

    const items = await this.gasFeeDataByTimestampDb.values(filter).all()
    return items
  }

  async getGasFeeData (input: any): Promise<any> {
    await this.tilReady()
    const { chainSlug, timestamp, blockNumber } = input
    try {
      if (blockNumber) {
        const key = `${chainSlug}-${blockNumber}`
        return await this.gasFeeDataByBlockNumberDb.get(key)
      } else {
        const key = `${chainSlug}-${timestamp}`
        return await this.gasFeeDataByTimestampDb.get(key)
      }
    } catch (err: any) {
      if (err.notFound) {
        return null
      }
      throw err
    }
  }

  async getNearestGasFeeData (input: any): Promise<any> {
    await this.tilReady()
    const { chainSlug, timestamp: targetTimestamp, blockNumber: targetBlockNumber } = input

    if (targetBlockNumber) {
      return this.getGasFeeData({ chainSlug, blockNumber: targetBlockNumber })
    }

    const varianceSeconds = 10 * 60 // 10 minutes
    const buffer = 20 * 60 // 20 minutes
    const startTimestamp = targetTimestamp - buffer
    const endTimestamp = Number(targetTimestamp) + buffer
    const filter = {
      gte: `${chainSlug}-${startTimestamp}`,
      lte: `${chainSlug}-${endTimestamp}~`,
      limit: 5000
    }

    const items = await this.gasFeeDataByTimestampDb.values(filter).all()
    const dates = items.map((item: any) => item.timestamp)
    const index = nearest(dates, targetTimestamp)
    if (index === -1) {
      return null
    }

    const item: any = items[index]
    const isTooFar = Math.abs(item.timestamp - targetTimestamp) > varianceSeconds
    if (isTooFar) {
      return null
    }

    return item
  }

  async getGasFeeDataRange (input: any): Promise<any> {
    await this.tilReady()
    const { chainSlug, timestamp } = input

    const buffer = 10 * 60 // 10 minutes
    const startTimestamp = Number(timestamp) - buffer
    const endTimestamp = timestamp
    const filter = {
      gte: `${chainSlug}-${startTimestamp}`,
      lte: `${chainSlug}-${endTimestamp}~`,
      limit: 5000
    }

    const items = await this.gasFeeDataByTimestampDb.values(filter).all()
    return items
  }

  async getSyncState (key: string) {
    await this.tilReady()
    return this.syncStateDb.get(key)
  }

  async putSyncState (key: string, blockNumber: number) {
    await this.tilReady()
    await this.syncStateDb.put(key, blockNumber)
  }

  private async startPrunePoller () {
    await this.tilReady()
    while (true) {
      try {
        await this.prune()
        await wait(60 * 60 * 1000)
      } catch (err: any) {
        console.error('prune poller error', err)
      }
    }
  }

  async getItemsToPrune (): Promise<any[]> {
    await this.tilReady()
    const OneMonthMs = 1 // 30 * 24 * 60 * 60 * 1000
    const oneMonthAgo = Math.floor((Date.now() - OneMonthMs) / 1000)

    const items = await this.gasFeeDataByTimestampDb.iterator({
      keys: true
    }).all()

    const filtered = items.filter(([key, value]: any) => {
      return value.timestamp < oneMonthAgo
    })
      .map(([key, value]: any) => {
        return {
          key,
          value
        }
      })

    return filtered
  }

  private async prune (): Promise<void> {
    await this.tilReady()
    const items = await this.getItemsToPrune()
    console.log(`items to prune: ${items.length}`)
    for (const item of items) {
      try {
        const { key, value } = item
        if (!key) {
          throw new Error(`key not found for item ${JSON.stringify(value)}`)
        }
        await this.gasFeeDataByTimestampDb.del(key)

        const key2 = `${value.chainSlug}-${value.blockNumber}`
        await this.gasFeeDataByBlockNumberDb.del(key2)
        console.log('prune', key, key2)
      } catch (err) {
        console.error(`error pruning db item: ${err.message}`)
      }
    }
  }

  close () {
    this.rootDb.close()
  }
}
