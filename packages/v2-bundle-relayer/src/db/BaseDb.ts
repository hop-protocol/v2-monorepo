import level from 'level-party'
import sub from 'subleveldown'
import { Mutex } from 'async-mutex'

export class BaseDb {
  db: any
  mutex: Mutex = new Mutex()

  constructor (dbPath: string, dbName: string) {
    if (!dbPath) {
      throw new Error('dbPath is required')
    }
    const eventsDb = level(dbPath)
    const subDb = sub(eventsDb, dbName, { valueEncoding: 'json' })
    this.db = subDb
    this.db
      .on('open', () => {
        console.debug('open')
      })
      .on('closed', () => {
        console.debug('closed')
      })
      .on('batch', (ops: any[]) => {
        for (const op of ops) {
          if (op.type === 'put') {
            console.log('put', op.key, op.value)
          }
        }
      })
      .on('put', (key: string, value: any) => {
        console.log('put', key, value)
      })
      .on('clear', (key: string) => {
        console.debug(`clear item, key=${key}`)
      })
      .on('error', (err: Error) => {
        console.error(`leveldb error: ${err.message}`)
      })
  }

  async _put (key: string, value: any): Promise<any> {
    return this.mutex.runExclusive(async () => {
      return this.db.put(key, value)
    })
  }

  async _update (key: string, value: any): Promise<any> {
    const oldValue = await this._get(key)
    const newValue = Object.assign({}, oldValue ?? {}, value)
    return this._put(key, newValue)
  }

  async _get (key: string): Promise<any> {
    let value: any = null
    try {
      value = await this.db.get(key)
    } catch (err) {
      if (!err.message.includes('Key not found in database')) {
        throw err
      }
    }

    return value ?? null
  }
}