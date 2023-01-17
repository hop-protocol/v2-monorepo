import { BaseDb } from '../BaseDb'
import { PropertyIndexDb } from '../propertyIndexDb'
import { RangeLookup, TimestampDb } from '../timestampDb'
import { SyncState, SyncStateDb } from '../syncStateDb'
import { get } from 'lodash'

export class EventsBaseDb<T> extends BaseDb {
  syncStateDb: SyncStateDb
  timestampDb: TimestampDb
  propertyIndexDb: Record<string, PropertyIndexDb> = {}

  constructor (dbPath: string, dbName: string) {
    super(dbPath, `events:${dbName}`)

    this.syncStateDb = new SyncStateDb(dbPath, dbName)
    this.timestampDb = new TimestampDb(dbPath, dbName)

    this.addPropertyIndex('context.transactionHash')
  }

  addPropertyIndex (propertyName: string): void {
    this.propertyIndexDb[propertyName] = new PropertyIndexDb(this.dbPath, this.dbName, propertyName)
  }

  async putSyncState (chainId: number, syncState: SyncState): Promise<boolean> {
    return this.syncStateDb.putSyncState(chainId, syncState)
  }

  async getSyncState (chainId: number): Promise<SyncState | null> {
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
    return this.getEventsFromIds(ids)
  }

  async getEventsFromIds (ids: string[]): Promise<T[]> {
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
    await this.updatePropertyIndexes(key, data)
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
    await this.updatePropertyIndexes(key, data)
    return true
  }

  async updatePropertyIndexes (primaryKey: string, data: Partial<T>): Promise<boolean> {
    for (const propertyName in this.propertyIndexDb) {
      const propertyIndexDb = this.propertyIndexDb[propertyName]
      let keyToIndexBy = get(data, propertyName)
      console.log('updatePropertyIndex', propertyName, keyToIndexBy)
      if (keyToIndexBy) {
        const existingItem = await propertyIndexDb.getPropertyIndex(keyToIndexBy)
        if (existingItem && existingItem.id !== keyToIndexBy) {
          keyToIndexBy = `${keyToIndexBy}-${primaryKey}`
          await propertyIndexDb.putPropertyIndex(keyToIndexBy, primaryKey)
        } else {
          await propertyIndexDb.putPropertyIndex(keyToIndexBy, primaryKey)
        }
      }
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

  getPrimaryKeyProperty (): string {
    throw new Error('Not implemented')
  }

  getKeyStringFromEvent (data: Partial<T>): string | null {
    throw new Error('Not implemented')
  }

  async getEventsByPropertyIndex (propertyName: string, value: string): Promise<Array<Partial<T>> | null> {
    if (propertyName === this.getPrimaryKeyProperty()) {
      return this.getEventsFromIds([value])
    }
    if (!this.propertyIndexDb[propertyName]) {
      throw new Error(`propertyIndex "${propertyName}" not found`)
    }
    const results = await this.propertyIndexDb[propertyName]?.getPropertyIndexes(value)
    if (results) {
      return this.getEventsFromIds(results.map((x: any) => x.value.id))
    }

    return null
  }

  async getEventByPropertyIndex (propertyName: string, value: string): Promise<Partial<T> | null> {
    if (propertyName === this.getPrimaryKeyProperty()) {
      return this.getEvent(value)
    }
    if (!this.propertyIndexDb[propertyName]) {
      throw new Error(`propertyIndex "${propertyName}" not found`)
    }
    const result = await this.propertyIndexDb[propertyName]?.getPropertyIndex(value)
    if (result?.id) {
      return this.getEvent(result.id)
    }

    return null
  }

  async getEventByTransactionHash (transactionHash: string): Promise<Partial<T> | null> {
    return this.getEventByPropertyIndex('context.transactionHash', transactionHash)
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
