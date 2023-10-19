import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleCommitted extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class BundleCommittedEventsDb extends EventsBaseDb<BundleCommitted> {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleCommitted)

    this.addPropertyIndex('bundleRoot')
  }

  getPrimaryKeyProperty (): string {
    return 'bundleId'
  }

  getKeyStringFromEvent (data: Partial<BundleCommitted>): string | null {
    return data?.bundleId ?? null
  }

  normalizeDataForGet (getData: Partial<BundleCommitted>): Partial<BundleCommitted> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    if (data.bundleFees && typeof data.bundleFees === 'string') {
      data.bundleFees = BigNumber.from(data.bundleFees)
    }
    return data
  }

  normalizeDataForPut (putData: Partial<BundleCommitted>): Partial<BundleCommitted> {
    const data = Object.assign({}, putData) as any
    if (data.bundleFees && typeof data.bundleFees !== 'string') {
      data.bundleFees = data.bundleFees.toString()
    }

    return data
  }
}
