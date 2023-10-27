import { BigNumber } from 'ethers'
import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleReceived extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  fromChainId: number
  toChainId: number
  relayWindowStart: number
  relayer: string
}

export class BundleReceivedEventsDb extends EventsBaseDb<BundleReceived> {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleReceived)

    this.addPropertyIndex('bundleRoot')
  }

  getPrimaryKeyProperty (): string {
    return 'bundleId'
  }

  getKeyStringFromEvent (data: Partial<BundleReceived>): string | null {
    return data?.bundleId ?? null
  }

  normalizeDataForGet (getData: Partial<BundleReceived>): Partial<BundleReceived> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    if (data.bundleFees && typeof data.bundleFees === 'string') {
      data.bundleFees = BigNumber.from(data.bundleFees)
    }
    return data
  }

  normalizeDataForPut (putData: Partial<BundleReceived>): Partial<BundleReceived> {
    const data = Object.assign({}, putData) as any
    if (data.bundleFees && typeof data.bundleFees !== 'string') {
      data.bundleFees = data.bundleFees.toString()
    }

    return data
  }
}
