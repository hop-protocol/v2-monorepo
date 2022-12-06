import { BaseDb } from './BaseDb'
import { SyncStateDb } from './SyncStateDb'

export class EventsBaseDb extends BaseDb {
  syncStateDb: SyncStateDb
  constructor (dbPath: string, dbName: string) {
    super(dbPath, `events:${dbName}`)

    this.syncStateDb = new SyncStateDb(dbPath, dbName)
  }
}
