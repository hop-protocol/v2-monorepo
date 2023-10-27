import { EventBase } from '../eventsDb/types'
import { EventType } from './types'
import { EventsBaseDb } from '../eventsDb/EventsBaseDb'

export interface TokenConfirmed extends EventBase {
  tokenId: string
}

export class TokenConfirmedEventsDb extends EventsBaseDb<TokenConfirmed> {
  constructor (dbPath: string) {
    super(dbPath, EventType.TokenConfirmed)
  }

  getPrimaryKeyProperty (): string {
    return 'tokenId'
  }

  getKeyStringFromEvent (data: Partial<TokenConfirmed>): string | null {
    return data?.tokenId ?? null
  }

  normalizeDataForGet (getData: Partial<TokenConfirmed>): Partial<TokenConfirmed> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    return data
  }

  normalizeDataForPut (putData: Partial<TokenConfirmed>): Partial<TokenConfirmed> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
