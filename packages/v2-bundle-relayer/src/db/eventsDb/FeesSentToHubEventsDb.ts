import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface FeesSentToHub extends EventBase {
  amount: BigNumber
}

export class FeesSentToHubEventsDb extends EventsBaseDb<FeesSentToHub> {
  constructor (dbPath: string) {
    super(dbPath, EventType.FeesSentToHub)
  }

  getKeyStringFromEvent (data: Partial<FeesSentToHub>): string | null {
    return data?.context?.transactionHash ?? null
  }

  normalizeDataForGet (getData: Partial<FeesSentToHub>): Partial<FeesSentToHub> {
    if (!getData) {
      return getData
    }

    const data = Object.assign({}, getData)
    if (data.amount && typeof data.amount === 'string') {
      data.amount = BigNumber.from(data.amount)
    }

    return data
  }

  normalizeDataForPut (putData: Partial<FeesSentToHub>): Partial<FeesSentToHub> {
    const data = Object.assign({}, putData) as any
    if (data.amount && typeof data.amount !== 'string') {
      data.amount = data.amount.toString()
    }

    return data
  }
}
