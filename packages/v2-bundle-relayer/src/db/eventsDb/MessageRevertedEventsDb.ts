import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageReverted extends EventBase {
  messageId: string
  fromChainId: number
  from: string
  to: string
}

export class MessageRevertedEventsDb extends EventsBaseDb<MessageReverted> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageReverted)
  }

  getKeyStringFromEvent (data: Partial<MessageReverted>): string | null {
    return data?.messageId ?? null
  }
}
