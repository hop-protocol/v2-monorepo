import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleForwarded extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
  toChainId: number
}

export class BundleForwardedEventsDb extends EventsBaseDb<BundleForwarded> {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleForwarded)
  }

  getKeyStringFromEvent (data: Partial<BundleForwarded>): string | null {
    return data?.bundleId ?? null
  }
}
