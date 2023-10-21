import { v4 as uuid } from 'uuid'

export class BundleReceived {
  db: any

  constructor(db: any) {
    this.db = db
  }

  async createTable() {
    await this.db.query(`CREATE TABLE IF NOT EXISTS bundle_received_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        bundle_id VARCHAR NOT NULL,
        bundle_root VARCHAR NOT NULL,
        bundle_fees NUMERIC NOT NULL,
        from_chain_id VARCHAR NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        relay_window_start INTEGER NOT NULL,
        relayer VARCHAR NOT NULL,
    )`)
  }

  async createIndexes() {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_bundle_received_events_bundle_id ON bundle_received_events (bundle_id);'
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
        from_chain_id AS "fromChainId",
        to_chain_id AS "toChainId",
        relay_window_start AS "relayWindowStart",
        relayer
      FROM
        bundle_received_events
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
    const { timestamp, txHash, bundleId, bundleRoot, fromChainId, toChainId } = item
    const args = [uuid(), timestamp, txHash, bundleId, bundleRoot, bundleFees, fromChainId, toChainId, relayWindowStart, relayer]
    await this.db.query(
      `INSERT INTO
        bundle_received_events
      (id, timestamp, tx_hash, bundle_id, bundle_root, bundle_fees, from_chain_id, to_chain_id, relay_window_start, relayer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (bundle_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3`, args
    )
  }
}
