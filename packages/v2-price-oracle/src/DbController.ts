import nearest from 'nearest-date'
import { Level } from 'level'
import { dbPath } from './config'
import wait from 'wait'

export class DbController {
  db: Level
  ready: boolean

  constructor () {
    const db = new Level(dbPath, { valueEncoding: 'json' })
    this.db = db
    this.init()
  }

  async init() {
    await this.db.open()
    this.ready = true
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
    const { chainSlug, timestamp, feeData } = input
    const key = `${chainSlug}-${timestamp}-fee-data`
    await this.db.put(key, {
      chainSlug,
      timestamp,
      ...feeData
    })
  }

  async getGasFeeData (input: any): Promise<any> {
    await this.tilReady()
    const { chainSlug, timestamp: targetTimestamp } = input

    const varianceSeconds = 10 * 60 // 10 minutes
    const buffer = 20 * 60 // 20 minutes
    const startTimestamp = targetTimestamp - buffer
    const endTimestamp = targetTimestamp + buffer
    const filter = {
      gte: `${chainSlug}-${startTimestamp}`,
      lte: `${chainSlug}-${endTimestamp}~`,
      limit: 100
    }

    const items = await this.db.values(filter).all()
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
}
