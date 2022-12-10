import { BaseDb } from '../BaseDb'

export interface TxState {
  id: string
  chainId: number
  transactionHash: string
  lastAttemptedAtMs: number
}

export class TxStateDb extends BaseDb {
  constructor (dbPath: string, dbName: string) {
    super(dbPath, `txState:${dbName}`)
  }

  async putTxState (id: string, state: Partial<TxState>): Promise<boolean> {
    await this._put(id, state)
    return true
  }

  async updateTxState (id: string, state: Partial<TxState>): Promise<boolean> {
    await this._update(id, state)
    return true
  }

  async getTxState (id: string): Promise<TxState> {
    return this._get(id)
  }

  async resetTxState (id: string): Promise<boolean> {
    await this._delete(id)
    return true
  }
}
