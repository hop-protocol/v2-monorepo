import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageSent extends EventBase {
  messageId: string
  from: string
  toChainId: number
  to: string
  data: string
}

export class MessageSentEventsDb extends EventsBaseDb<MessageSent> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageSent)
  }
}
