import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface MessageBundled extends EventBase {
  bundleId: string
  treeIndex: number
  messageId: string
}

export class MessageBundledEventsDb extends EventsBaseDb<MessageBundled> {
  constructor (dbPath: string) {
    super(dbPath, EventType.MessageBundled)
  }
}
