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

    this.addPropertyIndex('bundleRoot')
  }

  getPrimaryKeyProperty (): string {
    return 'bundleId'
  }

  getKeyStringFromEvent (data: Partial<BundleSet>): string | null {
    return data?.bundleId ?? null
  }
}
