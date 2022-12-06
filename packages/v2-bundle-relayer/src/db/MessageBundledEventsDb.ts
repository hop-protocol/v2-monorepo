import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageBundled extends EventBase {
  bundleId: string
  treeIndex: number
  messageId: string
}

export class MessageBundledEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageBundled)
  }

  async put (bundleId: string, data: MessageBundled): Promise<boolean> {
    return await this._put(bundleId, this.normalizeDataForPut(data))
  }

  async update (bundleId: string, data: Partial<MessageBundled>): Promise<boolean> {
    return this._update(bundleId, this.normalizeDataForPut(data))
  }

  async get (bundleId: string): Promise<MessageBundled | null> {
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
