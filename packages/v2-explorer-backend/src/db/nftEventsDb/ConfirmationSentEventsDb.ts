import { EventBase } from '../eventsDb/types'
import { EventType } from './types'
import { EventsBaseDb } from '../eventsDb/EventsBaseDb'

export interface ConfirmationSent extends EventBase {
  tokenId: string
  toChainId: number
}

export class ConfirmationSentEventsDb extends EventsBaseDb<ConfirmationSent> {
  constructor (dbPath: string) {
    super(dbPath, EventType.ConfirmationSent)
  }

  getPrimaryKeyProperty (): string {
    return 'tokenId'
  }

  getKeyStringFromEvent (data: Partial<ConfirmationSent>): string | null {
    return data?.tokenId ?? null
  }

  normalizeDataForGet (getData: Partial<ConfirmationSent>): Partial<ConfirmationSent> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    return data
  }

  normalizeDataForPut (putData: Partial<ConfirmationSent>): Partial<ConfirmationSent> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
