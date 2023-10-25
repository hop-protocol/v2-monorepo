import { BaseType } from './BaseType'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from './context'
import { v4 as uuid } from 'uuid'

export interface BundleSet extends BaseType {
  bundleId: string
  bundleRoot: string
  fromChainId: number
}

export class BundleSet {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_set_events (
        id TEXT PRIMARY KEY,
        bundle_id VARCHAR NOT NULL UNIQUE,
        bundle_root VARCHAR NOT NULL UNIQUE,
        from_chain_id VARCHAR NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_set_events_id ON bundle_set_events (bundle_id);'
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
        ${contextSqlSelect}
      FROM
        bundle_set_events
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
    const { bundleId, bundleRoot, fromChainId, context } = item
    const args = [
      uuid(), bundleId, bundleRoot, fromChainId,
      ...getOrderedInsertContextArgs(context)
    ]
    await this.db.query(
      `INSERT INTO
        bundle_set_events
      (
        id, bundle_id, bundle_root, from_chain_id,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (bundle_id)
      DO UPDATE SET _block_timestamp = $11, _transaction_hash = $7`, args
    )
  }
}
