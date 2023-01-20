import {
  Address,
  BigInt,
  ethereum
} from "@graphprotocol/graph-ts";
import {
  Transaction as TransactionEntity,
  Block as BlockEntity,
} from '../generated/schema'

export function createBlockEntityIfNotExists(event: ethereum.Event):void {
  let blockEntity = BlockEntity.load(event.block.hash.toHexString())
  if (blockEntity == null) {
    blockEntity = new BlockEntity(event.block.hash.toHexString())
    blockEntity.author = event.block.author
    blockEntity.difficulty = event.block.difficulty
    blockEntity.gasLimit = event.block.gasLimit
    blockEntity.gasUsed = event.block.gasUsed
    blockEntity.hash = event.block.hash
    blockEntity.number = event.block.number
    blockEntity.parentHash = event.block.parentHash
    blockEntity.receiptsRoot = event.block.receiptsRoot
    blockEntity.size = event.block.size
    blockEntity.stateRoot = event.block.stateRoot
    blockEntity.timestamp = event.block.timestamp
    blockEntity.totalDifficulty = event.block.totalDifficulty
    blockEntity.transactionsRoot = event.block.transactionsRoot
    blockEntity.unclesHash = event.block.unclesHash
    blockEntity.save()
  }
}

export function createTransactionEntityIfNotExists(event: ethereum.Event):void {
  let transactionEntity = TransactionEntity.load(event.transaction.hash.toHexString())
  if (transactionEntity == null) {
    transactionEntity = new TransactionEntity(event.transaction.hash.toHexString())
    transactionEntity.from = event.transaction.from
    transactionEntity.gasLimit = event.transaction.gasLimit
    transactionEntity.gasPrice = event.transaction.gasPrice
    transactionEntity.hash = event.transaction.hash
    transactionEntity.index = event.transaction.index
    // transactionEntity.input = event.transaction.input
    transactionEntity.to = event.transaction.to
    transactionEntity.value = event.transaction.value
    transactionEntity.save()
  }
}
