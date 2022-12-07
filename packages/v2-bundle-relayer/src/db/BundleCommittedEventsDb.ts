import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'
import { RangeLookup } from './TimestampDb'

export interface BundleCommitted extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class BundleCommittedEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleCommitted)
  }

  getTimestampKey (data: Partial<BundleCommitted>): string | null {
    if (typeof data?.context?.blockTimestamp === 'number' && typeof data?.context?.transactionIndex === 'number' && typeof data?.context?.logIndex === 'number') {
      return `${data.context.blockTimestamp}-${data.context.transactionIndex}-${data.context.logIndex}`
    }
    return null
  }

  async put (bundleId: string, data: BundleCommitted): Promise<boolean> {
    if (!bundleId) {
      throw new Error('bundleId is required')
    }
    await this._put(bundleId, this.normalizeDataForPut(data))
    const timestampKey = this.getTimestampKey(data)
    if (timestampKey) {
      await this.timestampDb.put(timestampKey, bundleId)
    }
    return true
  }

  async update (bundleId: string, data: Partial<BundleCommitted>): Promise<boolean> {
    if (!bundleId) {
      throw new Error('bundleId is required')
    }
    await this._update(bundleId, this.normalizeDataForPut(data))
    const timestampKey = this.getTimestampKey(data)
    if (timestampKey) {
      await this.timestampDb.put(timestampKey, bundleId)
    }
    return true
  }

  async get (bundleId: string): Promise<BundleCommitted | null> {
    if (!bundleId) {
      throw new Error('bundleId is required')
    }
    const value = await this._get(bundleId)
    return this.normalizeDataForGet(value)
  }

  normalizeDataForGet (getData: any): any {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    if (data.bundleFees && typeof data.bundleFees === 'string') {
      data.bundleFees = BigNumber.from(data.bundleFees)
    }
    return data
  }

  normalizeDataForPut (putData: any): any {
    const data = Object.assign({}, putData)
    if (data.bundleFees && typeof data.bundleFees !== 'string') {
      data.bundleFees = data.bundleFees.toString()
    }

    return data
  }

  async getFromRange (range: RangeLookup): Promise<BundleCommitted[]> {
    const bundleIds = await this.getByBlockTimestamp(range)
    console.log(bundleIds)
    const promises = bundleIds.map(async bundleId => await this.get(bundleId) as BundleCommitted)
    return Promise.all(promises)
  }
}
