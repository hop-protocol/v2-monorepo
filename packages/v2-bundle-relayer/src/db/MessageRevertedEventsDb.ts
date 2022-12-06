import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageReverted extends EventBase {
  messageId: string
  fromChainId: number
  from: string
  to: string
}

export class MessageRevertedEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageReverted)
  }

  async put (messageId: string, data: MessageReverted): Promise<boolean> {
    return await this._put(messageId, this.normalizeDataForPut(data))
  }

  async update (messageId: string, data: Partial<MessageReverted>): Promise<boolean> {
    return this._update(messageId, this.normalizeDataForPut(data))
  }

  async get (messageId: string): Promise<MessageReverted | null> {
    const value = await this._get(messageId)
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
