import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleForwarded extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
  toChainId: number
}

export class BundleForwardedEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleForwarded)
  }

  async put (bundleId: string, data: BundleForwarded): Promise<boolean> {
    return await this._put(bundleId, this.normalizeDataForPut(data))
  }

  async update (bundleId: string, data: Partial<BundleForwarded>): Promise<boolean> {
    return this._update(bundleId, this.normalizeDataForPut(data))
  }

  async get (bundleId: string): Promise<BundleForwarded| null> {
    const value = await this._get(bundleId)
    return this.normalizeDataForGet(value)
  }

  normalizeDataForGet (getData: any): any {
    if (!getData) {
      return getData
    }

    const data = Object.assign({}, getData)
    return data
  }

  normalizeDataForPut (putData: any): any {
    const data = Object.assign({}, putData)

    return data
  }
}
