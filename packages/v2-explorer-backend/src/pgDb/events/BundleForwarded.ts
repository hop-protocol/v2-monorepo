import { BaseType } from './BaseType'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from './context'
import { v4 as uuid } from 'uuid'

export interface BundleForwared extends BaseType {
  bundleId: string
  bundleRoot: string
  fromChainId: number
  toChainId: number
}

export class BundleForwarded {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_forwarded_events (
        id TEXT PRIMARY KEY,
        bundle_id VARCHAR NOT NULL UNIQUE,
        bundle_root VARCHAR NOT NULL UNIQUE,
        from_chain_id VARCHAR NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_forwareded_events_id ON bundle_forwarded_events (bundle_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp = 0, endTimestamp = Math.floor(Date.now() / 1000), limit = 10, page = 1 } = opts
    let offset = (page - 1) * limit
    if (offset < 0) {
      offset = 0
    }
    const items = await this.db.any(
      `SELECT
        bundle_id AS "bundleId",
        bundle_root AS "bundleRoot",
        from_chain_id AS "fromChainId",
        to_chain_id AS "toChainId",
        ${contextSqlSelect}
      FROM
        bundle_forwarded_events
      WHERE
        _block_timestamp >= $1
        AND
        _block_timestamp <= $2
      ORDER BY
        _block_timestamp
      DESC OFFSET $4`,
      [startTimestamp, endTimestamp, limit, offset])

    return getItemsWithContext(items)
  }

  async upsertItem (item: any) {
    const { bundleId, bundleRoot, fromChainId, toChainId, context } = item
    const args = [
      uuid(), bundleId, bundleRoot, fromChainId, toChainId,
      ...getOrderedInsertContextArgs(context)
    ]
    await this.db.query(
      `INSERT INTO
        bundle_forwarded_events
      (
        id, bundle_id, bundle_root, from_chain_id, to_chain_id,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (bundle_id)
      DO UPDATE SET _block_timestamp = $12, _transaction_hash = $8`, args
    )
  }
}
