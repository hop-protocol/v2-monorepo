import { BaseDb } from '../BaseDb'
import { RangeLookup, TimestampDb } from '../timestampDb'
import { SyncState, SyncStateDb } from '../syncStateDb'

export class EventsBaseDb<T> extends BaseDb {
  syncStateDb: SyncStateDb
  timestampDb: TimestampDb

  constructor (dbPath: string, dbName: string) {
    super(dbPath, `events:${dbName}`)

    this.syncStateDb = new SyncStateDb(dbPath, dbName)
    this.timestampDb = new TimestampDb(dbPath, dbName)
  }

  async putSyncState (chainId: number, syncState: SyncState): Promise<boolean> {
    return this.syncStateDb.putSyncState(chainId, syncState)
  }

  async getSyncState (chainId: number): Promise<SyncState> {
    return this.syncStateDb.getSyncState(chainId)
  }

  async resetSyncState (chainId: number): Promise<boolean> {
    return this.syncStateDb.resetSyncState(chainId)
  }

  async getByBlockTimestamp (rangeLookup: RangeLookup): Promise<string[]> {
    const keyValues = await this.timestampDb.getByRangeLookup(rangeLookup)
    return keyValues.map(({ value }) => value.id).filter(Boolean)
  }

  async getFromRange (range: RangeLookup): Promise<T[]> {
    const ids = await this.getByBlockTimestamp(range)
    const uniqueIds = [...new Set(ids)]
    const promises = uniqueIds.map(async id => await this.getEvent(id) as T)
    return Promise.all(promises)
  }

  async putEvent (key: string, data: T): Promise<boolean> {
    if (!key) {
      throw new Error('key is required')
    }
    // TODO: add validation is child
    if ((data as any).eventLog) {
      delete (data as any).eventLog
    }
    if ((data as any).eventName) {
      delete (data as any).eventName
    }
    await this._put(key, this.normalizeDataForPut(data))
    const timestampKey = this.getTimestampKeyString(data)
    if (timestampKey) {
      await this.timestampDb.putTimestampKey(timestampKey, key)
    }
    return true
  }

  async updateEvent (key: string, data: Partial<T>): Promise<boolean> {
    if (!key) {
      throw new Error('key is required')
    }
    await this._update(key, this.normalizeDataForPut(data))
    const timestampKey = this.getTimestampKeyString(data)
    if (timestampKey) {
      await this.timestampDb.putTimestampKey(timestampKey, key)
    }
    return true
  }

  async getEvent (key: string): Promise<Partial<T> | null> {
    if (!key) {
      throw new Error('key is required')
    }
    const value = await this._get(key)
    return this.normalizeDataForGet(value)
  }

  getTimestampKey (data: Partial<any>): Array<string|number|undefined> {
    return [
      data?.context?.blockTimestamp,
      data?.context?.transactionIndex,
      data?.context?.logIndex
    ]
  }

  getTimestampKeyString (data: Partial<T>): string | null {
    const values = this.getTimestampKey(data)
    const isOk = values.every(value => value !== undefined)
    if (isOk) {
      return values.join('-')
    }
    return null
  }

  getKeyStringFromEvent (data: Partial<T>): string | null {
    throw new Error('Not implemented')
  }

  normalizeDataForGet (getData: Partial<T>): Partial<T> {
    if (!getData) {
      return getData
    }

    const data = Object.assign({}, getData)
    return data
  }

  normalizeDataForPut (putData: Partial<T>): Partial<T> {
    const data = Object.assign({}, putData)

    return data
  }
}
