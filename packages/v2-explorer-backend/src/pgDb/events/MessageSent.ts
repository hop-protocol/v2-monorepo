import { v4 as uuid } from 'uuid'
import { BaseType } from './BaseType'

export interface MessageSent extends BaseType {
  messageId: string
  from: string
  toChainId: number
  to: string
  data: string
}

export class MessageSent {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS message_sent_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        message_id VARCHAR NOT NULL UNIQUE,
        "from" VARCHAR NOT NULL,
        to_chain_id VARCHAR NOT NULL,
        "to" VARCHAR NOT NULL,
        "data" VARCHAR NOT NULL
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_message_sent_events_message_id ON message_sent_events (message_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp, endTimestamp, limit, offset } = opts
    return this.db.any(
      `SELECT
        timestamp,
        tx_hash AS "txHash",
        message_id AS "messageId",
        "from",
        to_chain_id AS "toChainId",
        "to",
        "data"
      FROM
        message_sent_events
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
    const { timestamp, txHash, messageId, from, toChainId, to, data } = item
    const args = [uuid(), timestamp, txHash, messageId, from, toChainId, to, data]
    await this.db.query(
      `INSERT INTO
        message_sent_events
      (id, timestamp, tx_hash, message_id, "from", to_chain_id, "to", "data")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (message_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3`, args
    )
  }
}
