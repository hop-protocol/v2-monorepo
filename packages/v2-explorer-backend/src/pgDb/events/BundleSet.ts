import { v4 as uuid } from 'uuid'

export class BundleSet {
  db: any

  constructor(db: any) {
    this.db = db
  }

  async createTable() {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_set_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        bundle_id VARCHAR NOT NULL,
        bundle_root VARCHAR NOT NULL,
        from_chain_id VARCHAR NOT NULL
    )`)
  }

  async createIndexes() {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_set_events_id ON bundle_forwarded_events (bundle_id);'
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
        from_chain_id AS "fromChainId"
      FROM
        bundle_set_events
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
    const { timestamp, txHash, bundleId, bundleRoot, fromChainId } = item
    const args = [uuid(), timestamp, txHash, bundleId, bundleRoot, fromChainId]
    await this.db.query(
      `INSERT INTO
        bundle_set_events
      (id, timestamp, tx_hash, bundle_id, bundle_root, from_chain_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (bundle_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3`, args
    )
  }
}
