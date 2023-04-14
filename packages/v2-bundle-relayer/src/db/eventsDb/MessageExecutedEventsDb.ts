import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageExecuted extends EventBase {
  messageId: string
  fromChainId: number
}

export class MessageExecutedEventsDb extends EventsBaseDb<MessageExecuted> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageExecuted)
  }

  getPrimaryKeyProperty (): string {
    return 'messageId'
  }

  getKeyStringFromEvent (data: Partial<MessageExecuted>): string | null {
    return data?.messageId ?? null
  }
}
