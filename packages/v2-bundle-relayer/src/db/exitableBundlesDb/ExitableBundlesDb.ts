import { BaseDb } from '../BaseDb'
import { TxState } from '../txStateDb'

export interface ExitableBundles {
  bundleId: string
}

export class ExitableBundlesDb extends BaseDb {
  otherDbs: Record<string, any>

  constructor (dbPath: string, dbName: string) {
    super(dbPath, `exitableBundles:${dbName}`)
  }

  getKeyString (bundleId: string) {
    return `${bundleId}`
  }

  async getItems (): Promise<any[]> {
    const kv = await this._getKeyValues({
      gte: '',
      lte: '~'
    })

    const bundleIds = kv.map((item: any) => item.value.bundleId)
    const items: any[] = []
    for (const bundleId of bundleIds) {
      const eventItem = await this.otherDbs.bundleCommittedEventsDb.getEvent(bundleId)
      if (eventItem) {
        const delayMs = 10 * 60 * 1000 // 10min // TODO: make env var
        const txState: TxState = await this.otherDbs.txStateDb.getTxState(bundleId)
        let recentlyAttempted = false
        if (txState?.lastAttemptedAtMs) {
          recentlyAttempted = txState.lastAttemptedAtMs + delayMs > Date.now()
        }
        if (!recentlyAttempted) {
          items.push(eventItem)
        }
      }
    }

    return items
  }

  async putItem (bundleId: string): Promise<boolean> {
    const key = this.getKeyString(bundleId)
    await this._put(key, { bundleId })
    return true
  }

  async deleteItem (bundleId: string): Promise<boolean> {
    const key = this.getKeyString(bundleId)
    await this._delete(key)
    return true
  }
}
