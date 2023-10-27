import { BigNumber } from 'ethers'
import { EventBase } from '../eventsDb/types'
import { EventType } from './types'
import { EventsBaseDb } from '../eventsDb/EventsBaseDb'

export interface TransferSent extends EventBase {
  claimId: string
  tokenBusId: string
  to: string
  amount: BigNumber
  minAmountOut: BigNumber
  sourceClaimsSent: BigNumber
  bonus: BigNumber
}

export class TransferSentEventsDb extends EventsBaseDb<TransferSent> {
  constructor (dbPath: string) {
    super(dbPath, EventType.TransferSent)
  }

  getPrimaryKeyProperty (): string {
    return 'claimId'
  }

  getKeyStringFromEvent (data: Partial<TransferSent>): string | null {
    return data?.claimId ?? null
  }
}
