import { EventBase, EventType } from './types'
import { EventsBaseDb } from './EventsBaseDb'

export interface BundleSet extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
}

export class BundleSetEventsDb extends EventsBaseDb<BundleSet> {
  constructor (dbPath: string) {
    super(dbPath, EventType.BundleSet)
  }
}
