import { BigNumber } from 'ethers'
import { EventBase } from '../eventsDb/types'
import { EventType } from './types'
import { EventsBaseDb } from '../eventsDb/EventsBaseDb'

export interface TransferBonded extends EventBase {
  claimId: string
  tokenBusId: string
  to: string
  amount: BigNumber
  minAmountOut: BigNumber
  sourceClaimsSent: BigNumber
  fee: BigNumber
}

export class TransferBondedEventsDb extends EventsBaseDb<TransferBonded> {
  constructor (dbPath: string) {
    super(dbPath, EventType.TransferBonded)
  }

  getPrimaryKeyProperty (): string {
    return 'claimId'
  }

  getKeyStringFromEvent (data: Partial<TransferBonded>): string | null {
    return data?.claimId ?? null
  }
}
