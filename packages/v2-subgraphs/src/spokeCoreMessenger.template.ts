import {
  Address,
  BigInt
} from "@graphprotocol/graph-ts";
import {
  BundleCommitted,
  BundleSet,
  FeesSentToHub,
  MessageBundled,
  MessageRelayed,
  MessageReverted,
  MessageSent
} from '../generated/SpokeCoreMessenger/SpokeMessageBridge'
import {
  BundleCommitted as BundleCommittedEntity,
  BundleSet as BundleSetEntity,
  FeesSentToHub as FeesSentToHubEntity,
  MessageBundled as MessageBundledEntity,
  MessageRelayed as MessageRelayedEntity,
  MessageReverted as MessageRevertedEntity,
  MessageSent as MessageSentEntity
} from '../generated/schema'
import {
  createBlockEntityIfNotExists,
  createTransactionEntityIfNotExists,
} from './shared'

export function handleBundleCommitted(event: BundleCommitted): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = BundleCommittedEntity.load(id)
  if (entity == null) {
    entity = new BundleCommittedEntity(id)
  }

  entity.bundleId = event.params.bundleId
  entity.bundleRoot = event.params.bundleRoot
  entity.bundleFees = event.params.bundleFees
  entity.toChainId = event.params.toChainId
  entity.commitTime = event.params.commitTime

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

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

export function handleFeesSentToHub(event: FeesSentToHub): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = FeesSentToHubEntity.load(id)
  if (entity == null) {
    entity = new FeesSentToHubEntity(id)
  }

  entity.amount = event.params.amount

  createBlockEntityIfNotExists(event.params._event)
  createTransactionEntityIfNotExists(event.params._event)
  entity.block = event.params._event.block.hash.toHexString()
  entity.transaction = event.params._event.transaction.hash.toHexString()

  entity.save()
}

export function handleMessageBundled(event: MessageBundled): void {
  let id = event.transaction.hash.toHexString().concat(event.transactionLogIndex.toString())
  let entity = MessageBundledEntity.load(id)
  if (entity == null) {
    entity = new MessageBundledEntity(id)
  }

  entity.bundleId = event.params.bundleId
  entity.treeIndex = event.params.treeIndex
  entity.messageId = event.params.messageId

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
