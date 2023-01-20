import {
  Address,
  BigInt
} from "@graphprotocol/graph-ts";
import {
  BundleSet,
  MessageRelayed,
  MessageReverted,
  MessageSent,
  BundleReceived,
  BundleForwarded,
} from '../generated/hop-optimism-goerli/HubMessageBridge'
import {
  BundleSet as BundleSetEntity,
  MessageRelayed as MessageRelayedEntity,
  MessageReverted as MessageRevertedEntity,
  MessageSent as MessageSentEntity,
  BundleReceived as BundleReceivedEntity,
  BundleForwarded as BundleForwardedEntity
} from '../generated/schema'
import {
  createBlockEntityIfNotExists,
  createTransactionEntityIfNotExists,
} from './shared'

export function handleBundleSet(event: BundleSet): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = BundleSetEntity.load(id)
  if (entity == null) {
    entity = new BundleSetEntity(id)
  }

  entity.bundleId = event.params.bundleId
  entity.bundleRoot = event.params.bundleRoot
  entity.fromChainId = event.params.fromChainId

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleMessageRelayed(event: MessageRelayed): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = MessageRelayedEntity.load(id)
  if (entity == null) {
    entity = new MessageRelayedEntity(id)
  }

  entity.messageId = event.params.messageId
  entity.fromChainId = event.params.fromChainId
  entity.from = event.params.from
  entity.to = event.params.to

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleMessageReverted(event: MessageReverted): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = MessageRevertedEntity.load(id)
  if (entity == null) {
    entity = new MessageRevertedEntity(id)
  }

  entity.messageId = event.params.messageId
  entity.fromChainId = event.params.fromChainId
  entity.from = event.params.from
  entity.to = event.params.to

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleMessageSent(event: MessageSent): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = MessageSentEntity.load(id)
  if (entity == null) {
    entity = new MessageSentEntity(id)
  }

  entity.messageId = event.params.messageId
  entity.from = event.params.from
  entity.toChainId = event.params.toChainId
  entity.to = event.params.to
  entity.data = event.params.data

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleBundleReceived (event: BundleReceived): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = BundleReceivedEntity.load(id)
  if (entity == null) {
    entity = new BundleReceivedEntity(id)
  }

  entity.bundleId = event.params.bundleId
  entity.bundleRoot = event.params.bundleRoot
  entity.bundleFees = event.params.bundleFees
  entity.fromChainId = event.params.fromChainId
  entity.toChainId = event.params.toChainId
  entity.relayWindowStart = event.params.relayWindowStart
  entity.relayer = event.params.relayer

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleBundleForwarded (event: BundleForwarded): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = BundleForwardedEntity.load(id)
  if (entity == null) {
    entity = new BundleForwardedEntity(id)
  }

  entity.bundleId = event.params.bundleId
  entity.bundleRoot = event.params.bundleRoot
  entity.fromChainId = event.params.fromChainId
  entity.toChainId = event.params.toChainId

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}
