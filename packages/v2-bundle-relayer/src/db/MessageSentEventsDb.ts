import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageSent extends EventBase {
  messageId: string
  from: string
  toChainId: number
  to: string
  data: string
}

export class MessageSentEventsDb extends EventsBaseDb {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageSent)
  }

  async put (messageId: string, data: MessageSent): Promise<boolean> {
    return await this._put(messageId, this.normalizeDataForPut(data))
  }

  async update (messageId: string, data: Partial<MessageSent>): Promise<boolean> {
    return this._update(messageId, this.normalizeDataForPut(data))
  }

  async get (messageId: string): Promise<MessageSent | null> {
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
