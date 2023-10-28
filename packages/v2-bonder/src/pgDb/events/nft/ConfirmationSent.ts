import { BaseType } from '../BaseType'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from '../context'
import { v4 as uuid } from 'uuid'

export interface NftConfirmationSent extends BaseType {
  tokenId: string
  toChainId: string
}

export class NftConfirmationSent {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS nft_confirmation_sent_events (
        id TEXT PRIMARY KEY,
        token_id VARCHAR NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_nft_confirmation_sent_events_bundle_id ON nft_confirmation_sent_events (token_id);'
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
        to_chain_id AS "toChainId",
        ${contextSqlSelect}
      FROM
        nft_confirmation_sent_events
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
    const { tokenId, toChainId, context } = this.normalizeDataForPut(item)
    const args = [
      uuid(), tokenId, toChainId,
      ...getOrderedInsertContextArgs(context)
    ]

    await this.db.query(
      `INSERT INTO
        nft_confirmation_sent_events
      (
        id, token_id, to_chain_id,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (claim_id)
      DO UPDATE SET _block_timestamp = $10, _transaction_hash = $6`, args
    )
  }

  normalizeDataForGet (getData: Partial<NftConfirmationSent>): Partial<NftConfirmationSent> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)

    return data
  }

  normalizeDataForPut (putData: Partial<NftConfirmationSent>): Partial<NftConfirmationSent> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
