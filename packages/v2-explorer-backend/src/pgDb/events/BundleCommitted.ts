import { BaseType } from './BaseType'
import { BigNumber } from 'ethers'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from './context'
import { v4 as uuid } from 'uuid'

export interface BundleCommitted extends BaseType {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class BundleCommitted {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_committed_events (
        id TEXT PRIMARY KEY,
        bundle_id VARCHAR NOT NULL UNIQUE,
        bundle_root VARCHAR NOT NULL UNIQUE,
        bundle_fees NUMERIC NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        commit_time INTEGER NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_committed_events_bundle_id ON bundle_committed_events (bundle_id);'
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
        bundle_fees AS "bundleFees",
        to_chain_id AS "toChainId",
        commit_time AS "commitTime",
        ${contextSqlSelect}
      FROM
        bundle_committed_events
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
    const { bundleId, bundleRoot, bundleFees, toChainId, commitTime, context } = this.normalizeDataForPut(item)
    const args = [
      uuid(), bundleId, bundleRoot, bundleFees, toChainId, commitTime,
      ...getOrderedInsertContextArgs(context)
    ]
    await this.db.query(
      `INSERT INTO
        bundle_committed_events
      (
        id, bundle_id, bundle_root, bundle_fees, to_chain_id, commit_time,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (bundle_id)
      DO UPDATE SET _block_timestamp = $13, _transaction_hash = $8`, args
    )
  }

  normalizeDataForGet (getData: Partial<BundleCommitted>): Partial<BundleCommitted> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    if (data.bundleFees && typeof data.bundleFees === 'string') {
      data.bundleFees = BigNumber.from(data.bundleFees)
    }
    return data
  }

  normalizeDataForPut (putData: Partial<BundleCommitted>): Partial<BundleCommitted> {
    const data = Object.assign({}, putData) as any
    if (data.bundleFees && typeof data.bundleFees !== 'string') {
      data.bundleFees = data.bundleFees.toString()
    }

    return data
  }
}
