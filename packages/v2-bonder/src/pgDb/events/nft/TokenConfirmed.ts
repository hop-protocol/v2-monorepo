import { BaseType } from '../BaseType'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from '../context'
import { v4 as uuid } from 'uuid'

export interface NftTokenConfirmed extends BaseType {
  tokenId: string
}

export class NftTokenConfirmed {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS nft_token_confirmed_events (
        id TEXT PRIMARY KEY,
        token_id VARCHAR NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_nft_token_confirmed_events_bundle_id ON nft_token_confirmed_events (token_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp = 0, endTimestamp = Math.floor(Date.now() / 1000), limit = 10, page = 1, filter } = opts
    let offset = (page - 1) * limit
    if (offset < 0) {
      offset = 0
    }
    const args = [startTimestamp, endTimestamp, limit, offset]
    if (filter?.transactionHash) {
      args.push(filter.transactionHash)
    }
    const items = await this.db.any(
      `SELECT
        token_id AS "tokenId",
        ${contextSqlSelect}
      FROM
        nft_token_confirmed_events
      WHERE
        _block_timestamp >= $1
        AND
        _block_timestamp <= $2
        ${filter?.transactionHash ? 'AND _transaction_hash = $5' : ''}
      ORDER BY
        _block_timestamp
      DESC
      LIMIT $3
      OFFSET $4`,
      args)

    return getItemsWithContext(items)
  }

  async upsertItem (item: any) {
    const { tokenId, context } = this.normalizeDataForPut(item)
    const args = [
      uuid(), tokenId,
      ...getOrderedInsertContextArgs(context)
    ]

    await this.db.query(
      `INSERT INTO
        nft_token_confirmed_events
      (
        id, token_id,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (token_id)
      DO UPDATE SET _block_timestamp = $9, _transaction_hash = $5`, args
    )
  }

  normalizeDataForGet (getData: Partial<NftTokenConfirmed>): Partial<NftTokenConfirmed> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)

    return data
  }

  normalizeDataForPut (putData: Partial<NftTokenConfirmed>): Partial<NftTokenConfirmed> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
