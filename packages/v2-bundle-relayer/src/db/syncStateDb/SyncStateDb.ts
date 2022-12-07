import { BaseDb } from '../BaseDb'

export interface SyncState {
  fromBlock: number
  toBlock: number
}

export class SyncStateDb extends BaseDb {
  constructor (dbPath: string, dbName: string) {
    super(dbPath, `syncState:${dbName}`)
  }

  async putSyncState (state: SyncState): Promise<boolean> {
    await this._put('state', state)
    return true
  }

  async getSyncState (): Promise<SyncState> {
    return this._get('state')
  }
}
