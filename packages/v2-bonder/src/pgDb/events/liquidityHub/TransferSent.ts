import { BaseType } from '../BaseType'
import { BigNumber } from 'ethers'
import { contextSqlCreation, contextSqlInsert, contextSqlSelect, getItemsWithContext, getOrderedInsertContextArgs } from '../context'
import { v4 as uuid } from 'uuid'

export interface TransferSent extends BaseType {
  claimId: string
  tokenBusId: string
  to: string
  amount: BigNumber
  minAmountOut: BigNumber
  sourceClaimsSent: BigNumber
  bonus: BigNumber
}

export class TransferSent {
  db: any

  constructor (db: any) {
    this.db = db
  }

  async createTable () {
    await this.db.query(`CREATE TABLE IF NOT EXISTS transfer_sent_events (
        id TEXT PRIMARY KEY,
        claim_id VARCHAR NOT NULL UNIQUE,
        token_bus_id VARCHAR NOT NULL,
        "to" VARCHAR NOT NULL,
        amount NUMERIC NOT NULL,
        min_amount_out NUMERIC NOT NULL,
        source_claims_sent NUMERIC NOT NULL,
        bonus NUMERIC NOT NULL,
        ${contextSqlCreation}
    )`)
  }

  async createIndexes () {
    await this.db.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_transfer_sent_events_claim_id ON transfer_sent_events (claim_id);'
    )
  }

  async getItems (opts: any = {}) {
    const { startTimestamp = 0, endTimestamp = Math.floor(Date.now() / 1000), limit = 10, page = 1, filter } = opts
    let offset = (page - 1) * limit
    if (offset < 0) {
      offset = 0
    }
    const args = [startTimestamp, endTimestamp, limit, offset]
    if (filter?.claimId) {
      args.push(filter.claimId)
    } else if (filter?.transactionHash) {
      args.push(filter.transactionHash)
    }
    const items = await this.db.any(
      `SELECT
        claim_id AS "claimId",
        token_bus_id AS "tokenBusId",
        "to",
        amount,
        min_amount_out AS "minAmountOut",
        source_claims_sent AS "sourceClaimsSent",
        bonus,
        ${contextSqlSelect}
      FROM
        transfer_sent_events
      WHERE
        _block_timestamp >= $1
        AND
        _block_timestamp <= $2
        ${filter?.claimId ? 'AND claim_id = $5' : ''}
        ${filter?.transactionHash ? 'AND _transaction_hash = $5' : ''}
      ORDER BY
        _block_timestamp
      DESC
      LIMIT $3
      OFFSET $4`,
      args)

    return getItemsWithContext(items)
  }

  async getUnbondedTransfers (opts: any) {
    const { startTimestamp = 0, endTimestamp = Math.floor(Date.now() / 1000), limit = 10, page = 1, filter } = opts
    let offset = (page - 1) * limit
    if (offset < 0) {
      offset = 0
    }
    const args = [startTimestamp, endTimestamp, limit, offset]
    const items = await this.db.any(
      `SELECT
        tse.claim_id AS "claimId",
        tse.token_bus_id AS "tokenBusId",
        tse."to",
        tse.amount,
        tse.min_amount_out AS "minAmountOut",
        tse.source_claims_sent AS "sourceClaimsSent",
        tse.bonus,
        ${contextSqlSelect}
      FROM
        transfer_sent_events tse
      LEFT JOIN transfer_bonded_events tbe
        ON tse.claim_id = tbe.claim_id
      WHERE
        tse._block_timestamp >= $1
        AND
        tse._block_timestamp <= $2
        AND
        tbe.claim_id IS NULL
      ORDER BY
        tse._block_timestamp DESC
      LIMIT $3
      OFFSET $4`,
      args
    )

    return getItemsWithContext(items)
  }

  async upsertItem (item: any) {
    const { claimId, tokenBusId, to, amount, minAmountOut, sourceClaimsSent, bonus, context } = this.normalizeDataForPut(item)
    const args = [
      uuid(), claimId, tokenBusId, to, amount, minAmountOut, sourceClaimsSent, bonus,
      ...getOrderedInsertContextArgs(context)
    ]

    await this.db.query(
      `INSERT INTO
        token_sent_events
      (
        id, claim_id, token_bus_id, to, amount, min_amount_out, source_claims_sent, bonus,
        ${contextSqlInsert}
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      ON CONFLICT (claim_id)
      DO UPDATE SET _block_timestamp = $15, _transaction_hash = $11`, args
    )
  }

  normalizeDataForGet (getData: Partial<TransferSent>): Partial<TransferSent> {
    if (!getData) {
      return getData
    }
    const data = Object.assign({}, getData)
    if (data.amount && typeof data.amount === 'string') {
      data.amount = BigNumber.from(data.amount)
    }
    if (data.minAmountOut && typeof data.minAmountOut === 'string') {
      data.minAmountOut = BigNumber.from(data.minAmountOut)
    }
    if (data.sourceClaimsSent && typeof data.sourceClaimsSent === 'string') {
      data.sourceClaimsSent = BigNumber.from(data.sourceClaimsSent)
    }
    if (data.bonus && typeof data.bonus === 'string') {
      data.bonus = BigNumber.from(data.bonus)
    }

    return data
  }

  normalizeDataForPut (putData: Partial<TransferSent>): Partial<TransferSent> {
    const data = Object.assign({}, putData) as any
    if (data.amount && typeof data.amount !== 'string') {
      data.amount = data.amount.toString()
    }
    if (data.minAmountOut && typeof data.minAmountOut !== 'string') {
      data.minAmountOut = data.minAmountOut.toString()
    }
    if (data.sourceClaimsSent && typeof data.sourceClaimsSent !== 'string') {
      data.sourceClaimsSent = data.sourceClaimsSent.toString()
    }
    if (data.bonus && typeof data.bonus !== 'string') {
      data.bonus = data.bonus.toString()
    }

    return data
  }
}
