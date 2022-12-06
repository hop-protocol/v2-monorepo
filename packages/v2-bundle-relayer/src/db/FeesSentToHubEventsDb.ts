import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface FeesSentToHub extends EventBase {
  amount: BigNumber
}

export class FeesSentToHubEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.FeesSentToHub)
  }

  async put (bundleId: string, data: FeesSentToHub): Promise<boolean> {
    return await this._put(bundleId, this.normalizeDataForPut(data))
  }

  async update (bundleId: string, data: Partial<FeesSentToHub>): Promise<boolean> {
    return this._update(bundleId, this.normalizeDataForPut(data))
  }

  async get (bundleId: string): Promise<FeesSentToHub | null> {
    const value = await this._get(bundleId)
    return this.normalizeDataForGet(value)
  }

  normalizeDataForGet (getData: any): any {
    if (!getData) {
      return getData
    }

    const data = Object.assign({}, getData)
    if (data.amount && typeof data.amount === 'string') {
      data.amount = BigNumber.from(data.amount)
    }

    return data
  }

  normalizeDataForPut (putData: any): any {
    const data = Object.assign({}, putData)
    if (data.amount && typeof data.amount !== 'string') {
      data.amount = data.amount.toString()
    }

    return data
  }
}
