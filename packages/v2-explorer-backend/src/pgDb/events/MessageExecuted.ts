import { v4 as uuid } from 'uuid'

export class MessageExecuted {
  db: any

  constructor(db: any) {
    this.db = db
  }

  async createTable() {
    await this.db.query(`CREATE TABLE IF NOT EXISTS message_executed_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        tx_hash VARCHAR NOT NULL,
        message_id VARCHAR NOT NULL,
        from_chain_id VARCHAR NOT NULL
    )`)
  }

  async createIndexes() {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_message_executed_events_message_id ON message_executed_events (message_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp, endTimestamp, limit, offset } = opts
    return this.db.any(
      `SELECT
        timestamp,
        tx_hash AS "txHash",
        message_id AS "messageId",
        from_chain_id AS "fromChainId"
      FROM
        message_executed_events
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
    const { timestamp, txHash, messageId, fromChainId } = item
    const args = [uuid(), timestamp, txHash, messageId, fromChainId]
    await this.db.query(
      `INSERT INTO
        message_executed_events
      (id, timestamp, tx_hash, message_id, fromChaiNId )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (message_id)
      DO UPDATE SET timestamp = $2, tx_hash = $3`, args
    )
  }
}
