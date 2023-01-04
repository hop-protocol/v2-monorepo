import { BaseDb } from '../BaseDb'

export class PropertyIndexDb extends BaseDb {
  constructor (dbPath: string, parentDbName: string, propertyName: string) {
    super(dbPath, `${parentDbName}:${propertyName}`)
  }

  async putPropertyIndex (key: string, id: string): Promise<boolean> {
    await this._put(key, { id })
    return true
  }

  async getPropertyIndex (key: string): Promise<any> {
    return this._get(key)
  }
}
