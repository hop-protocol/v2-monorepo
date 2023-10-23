import { v4 as uuid } from 'uuid'
import { BaseType } from './BaseType'

export interface MessageBundled extends BaseType {
  messageId: string
  bundleId: string
  treeIndex: number
}

export class MessageBundled {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS message_bundled_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        message_id VARCHAR NOT NULL UNIQUE,
        bundle_id VARCHAR NOT NULL,
        tree_index INTEGER NOT NULL
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_message_bundled_events_message_id_bundle_id ON message_bundled_events (message_id, bundle_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp, endTimestamp, limit, offset } = opts
    return this.db.any(
      `SELECT
        timestamp,
        tx_hash AS "txHash",
        message_id AS "messageId",
        bundle_id AS "bundleId",
        tree_index AS "treeIndex"
      FROM
        message_bundled_events
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
    const { timestamp, txHash, messageId, bundleId, treeIndex } = item
    const args = [uuid(), timestamp, txHash, messageId, bundleId, treeIndex]
    await this.db.query(
      `INSERT INTO
        message_bundled_events
      (id, timestamp, tx_hash, message_id, bundle_id, tree_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (message_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3, bundle_id = $5`, args
    )
  }
}
