import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageBundled extends EventBase {
  messageId: string
  bundleId: string
  treeIndex: number
}

export class MessageBundledEventsDb extends EventsBaseDb<MessageBundled> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageBundled)

    this.addPropertyIndex('bundleId')
  }

  getPrimaryKeyProperty (): string {
    return 'messageId'
  }

  getKeyStringFromEvent (data: Partial<MessageBundled>): string | null {
    return data?.messageId ?? null
  }
}
