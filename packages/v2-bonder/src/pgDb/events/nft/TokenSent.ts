import { BaseType } from '../BaseType'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from '../context'
import { v4 as uuid } from 'uuid'

export interface NftTokenSent extends BaseType {
  toChainId: string
  to: string
  tokenId: string
  newTokenId: string
}

export class NftTokenSent {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS nft_token_sent_events (
        id TEXT PRIMARY KEY,
        to_chain_id VARCHAR NOT NULL,
        "to" VARCHAR NOT NULL,
        token_id VARCHAR NOT NULL,
        new_token_id VARCHAR NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_nft_token_sent_events_bundle_id ON nft_token_sent_events (token_id);'
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
        to_chain_id AS "toChainId",
        "to",
        token_id AS "tokenId",
        new_token_id AS "newTokenId",
        ${contextSqlSelect}
      FROM
        nft_token_sent_events
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
    const { toChainId, to, tokenId, newTokenId, context } = this.normalizeDataForPut(item)
    const args = [
      uuid(), toChainId, to, tokenId, newTokenId,
      ...getOrderedInsertContextArgs(context)
    ]

    await this.db.query(
      `INSERT INTO
        nft_token_sent_events
      (
        id, to_chain_id, to, token_id, new_token_id
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (claim_id)
      DO UPDATE SET _block_timestamp = $12, _transaction_hash = $8`, args
    )
  }

  normalizeDataForGet (getData: Partial<NftTokenSent>): Partial<NftTokenSent> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)

    return data
  }

  normalizeDataForPut (putData: Partial<NftTokenSent>): Partial<NftTokenSent> {
    const data = Object.assign({}, putData) as any

    return data
  }
}
