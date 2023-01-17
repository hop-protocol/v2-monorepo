import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageRelayed extends EventBase {
  messageId: string
  fromChainId: number
  from: string
  to: string
}

export class MessageRelayedEventsDb extends EventsBaseDb<MessageRelayed> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageRelayed)
  }

  getPrimaryKeyProperty (): string {
    return 'messageId'
  }

  getKeyStringFromEvent (data: Partial<MessageRelayed>): string | null {
    return data?.messageId ?? null
  }
}
