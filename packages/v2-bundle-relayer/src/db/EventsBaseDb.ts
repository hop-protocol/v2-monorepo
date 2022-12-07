import { BaseDb } from './BaseDb'
import { RangeLookup, TimestampDb } from './TimestampDb'
import { SyncState, SyncStateDb } from './SyncStateDb'

export class EventsBaseDb extends BaseDb {
  syncStateDb: SyncStateDb
  timestampDb: TimestampDb

  constructor (dbPath: string, dbName: string) {
    super(dbPath, `events:${dbName}`)

    this.syncStateDb = new SyncStateDb(dbPath, dbName)
    this.timestampDb = new TimestampDb(dbPath, dbName)
  }

  async updateSyncState (syncState: SyncState): Promise<boolean> {
    return this.syncStateDb.updateSyncState(syncState)
  }

  async getSyncState (): Promise<SyncState> {
    return this.syncStateDb.getSyncState()
  }

  async getByBlockTimestamp (rangeLookup: RangeLookup): Promise<any[]> {
    const keyValues = await this.timestampDb.getByRangeLookup(rangeLookup)
    return keyValues.map(({ value }) => value.id).filter(Boolean)
  }
}
