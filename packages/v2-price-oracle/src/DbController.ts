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
    const { chainSlug, timestamp: targetTimestamp } = input

    const varianceSeconds = 10 * 60 // 10 minutes
    const buffer = 20 * 60 // 20 minutes
    const startTimestamp = targetTimestamp - buffer
    const endTimestamp = Number(targetTimestamp) + buffer
    const filter = {
      gte: `${chainSlug}-${startTimestamp}`,
      lte: `${chainSlug}-${endTimestamp}~`,
      limit: 100
    }

    const items = await this.gasFeeDataByTimestampDb.values(filter).all()
    console.log(JSON.stringify(items))
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

  async getSyncState (key: string) {
    await this.tilReady()
    return this.syncStateDb.get(key)
  }

  async putSyncState (key: string, blockNumber: number) {
    await this.tilReady()
    await this.syncStateDb.put(key, blockNumber)
  }

  close () {
    this.rootDb.close()
  }
}
