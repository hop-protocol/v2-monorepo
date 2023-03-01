import { EventBase } from '../eventsDb/types'
import { EventType } from './types'
import { EventsBaseDb } from '../eventsDb/EventsBaseDb'

export interface TokenSent extends EventBase {
  toChainId: number
  to: string
  tokenId: string
  newTokenId: string
}

export class TokenSentEventsDb extends EventsBaseDb<TokenSent> {
  constructor (dbPath: string) {
    super(dbPath, EventType.TokenSent)

    this.addPropertyIndex('newTokenId')
  }

  getPrimaryKeyProperty (): string {
    return 'tokenId'
  }

  getKeyStringFromEvent (data: Partial<TokenSent>): string | null {
    return data?.tokenId ?? null
  }

  normalizeDataForGet (getData: Partial<TokenSent>): Partial<TokenSent> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    return data
  }

  normalizeDataForPut (putData: Partial<TokenSent>): Partial<TokenSent> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
