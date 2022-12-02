import { BaseDb } from './BaseDb'
import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'

export interface BundleCommitted extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class BundleCommittedEventsDb extends BaseDb {
  constructor (dbPath: string) {
    super(dbPath, `events:${EventType.BundleCommitted}`)
  }

  async put (bundleId: string, data: BundleCommitted): Promise<boolean> {
    return await this._put(bundleId, this.normalizeDataForPut(data))
  }

  async update (bundleId: string, data: Partial<BundleCommitted>): Promise<boolean> {
    return this._update(bundleId, this.normalizeDataForPut(data))
  }

  async get (bundleId: string): Promise<BundleCommitted | null> {
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
}
