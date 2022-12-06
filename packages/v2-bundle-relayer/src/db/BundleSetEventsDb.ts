import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleSet extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
}

export class BundleSetEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleSet)
  }

  async put (bundleId: string, data: BundleSet): Promise<boolean> {
    return await this._put(bundleId, this.normalizeDataForPut(data))
  }

  async update (bundleId: string, data: Partial<BundleSet>): Promise<boolean> {
    return this._update(bundleId, this.normalizeDataForPut(data))
  }

  async get (bundleId: string): Promise<BundleSet| null> {
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
