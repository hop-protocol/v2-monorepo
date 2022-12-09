import { BaseDb } from '../BaseDb'

export type RangeLookup = {
  lt?: number
  gt?: number
}

export class TimestampDb extends BaseDb {
  constructor (dbPath: string, dbName: string) {
    super(dbPath, `syncState:${dbName}`)
  }

  async putTimestampKey (timestampKey: string, id: string): Promise<boolean> {
    await this._put(timestampKey, { id })
    return true
  }

  async getByRangeLookup (rangeLookup: RangeLookup): Promise<any[]> {
    return this._getKeyValues({
      gte: rangeLookup.gt?.toString(),
      lte: rangeLookup.lt ? `${rangeLookup.lt?.toString() ?? ''}~` : undefined // tilde is intentional
    })
  }
}
