import { v4 as uuid } from 'uuid'

export class BundleCommitted {
  db: any

  constructor(db: any) {
    this.db = db
  }

  async createTable() {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_committed_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        bundle_id VARCHAR NOT NULL,
        bundle_root VARCHAR NOT NULL,
        bundle_fees NUMERIC NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        commit_time INTEGER NOT NULL
    )`)
  }

  async createIndexes() {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_committed_events_bundle_id ON bundle_committed_events (bundle_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp, endTimestamp, limit, offset } = opts
    return this.db.any(
      `SELECT
        timestamp,
        tx_hash AS "txHash",
        bundle_id AS "bundleId"
        bundle_root AS "bundleRoot",
        bundle_fees AS "bundleFees",
        to_chain_id AS "toChainId",
        commit_time AS "commitTime"
      FROM
        bundle_committed_events
      WHERE
        timestamp >= $1
        AND
        timestamp <= $2
      ORDER BY
        timestamp
      DESC OFFSET $4`,
      [startTimestamp, endTimestamp, limit, offset])
  }

  async upsertItem (item: any) {
    const { timestamp, txHash, bundleId, bundleRoot, bundleFees, toChainId, commitTime } = item
    const args = [uuid(), timestamp, txHash, bundleId, bundleRoot, bundleFees, toChainId, commitTime]
    await this.db.query(
      `INSERT INTO
        bundle_committed_events
      (id, timestamp, tx_hash, bundle_id, bundle_root, bundle_fees, to_chain_id, commit_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (bundle_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3`, args
    )
  }
}
