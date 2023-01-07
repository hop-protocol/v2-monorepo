import pkg from '../package.json'
import { BigNumber } from 'ethers'
import { BundleCommitted, BundleCommittedEventFetcher } from './events/BundleCommitted'
import { BundleForwarded, BundleForwardedEventFetcher } from './events/BundleForwarded'
import { BundleReceived, BundleReceivedEventFetcher } from './events/BundleReceived'
import { BundleSet, BundleSetEventFetcher } from './events/BundleSet'
import { DateTime } from 'luxon'
import { EventFetcher } from './eventFetcher'
import { FeesSentToHub, FeesSentToHubEventFetcher } from './events/FeesSentToHub'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'
import { MerkleTree } from './utils/MerkleTree'
import { MessageBundled, MessageBundledEventFetcher } from './events/MessageBundled'
import { MessageRelayed, MessageRelayedEventFetcher } from './events/MessageRelayed'
import { MessageReverted, MessageRevertedEventFetcher } from './events/MessageReverted'
import { MessageSent, MessageSentEventFetcher } from './events/MessageSent'
import { OptimismRelayer } from './exitRelayers/OptimismRelayer'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { chainSlugMap } from './utils/chainSlugMap'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { getProvider } from './utils/getProvider'
import { goerliAddresses } from '@hop-protocol/v2-core/addresses'

const cache : Record<string, any> = {}

export type Options = {
  batchBlocks?: number,
  contractAddresses?: Record<string, any>
}

export type BundleProof = {
  bundleId: string
  treeIndex: number
  siblings: string[]
  totalLeaves: number
}

export type GetEventsInput = {
  chainId: number
  fromBlock: number
  toBlock?: number
}

export type GetGeneralEventsInput = {
  eventName?: string
  eventNames?: string[]
  chainId: number
  fromBlock: number
  toBlock?: number
}

export type HasAuctionStartedInput = {
  fromChainId: number
  bundleCommittedEvent: BundleCommitted
}

export type GetSpokeExitTimeInput = {
  fromChainId: number
  toChainId: number
}

export type GetRelayRewardInput = {
  fromChainId: number,
  bundleCommittedEvent: BundleCommitted
}

export type GetEstimatedTxCostForForwardMessageInput = {
  chainId: number,
}

export type ShouldAttemptForwardMessageInput = {
  fromChainId: number,
  bundleCommittedEvent: BundleCommitted
}

export type GetBundleExitPopulatedTxInput = {
  fromChainId: number,
  bundleCommittedEvent?: BundleCommitted
  bundleCommittedTransactionHash?: string
}

export type GetSendMessagePopulatedTxInput = {
  fromChainId: number,
  toChainId: number,
  toAddress: string,
  toCalldata: string
}

export type GetEventContextInput = {
  chainId: number
  event: any,
}

export type GetRouteDataInput = {
  fromChainId: number,
  toChainId: number
}

export type GetMessageFeeInput = {
  fromChainId: number,
  toChainId: number
}

export type GetMaxBundleMessageCountInput = {
  fromChainId: number,
  toChainId: number
}

export type GetIsBundleSetInput = {
  fromChainId: number,
  toChainId: number,
  bundleId: string
}

export type GetMessageSentEventFromTransactionReceiptInput = {
  fromChainId: number,
  receipt: any
}

export type GetMessageSentEventFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetMessageBundledEventFromMessageIdInput = {
  fromChainId: number,
  messageId: string
}

export type GetMessageBundledEventFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetMessageIdFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetMessageBundleIdFromMessageIdInput = {
  fromChainId: number,
  messageId: string
}

export type GetMessageBundleIdFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetMessageTreeIndexFromMessageIdInput = {
  fromChainId: number,
  messageId: string
}

export type GetMessageTreeIndexFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetMessageBundledEventsForBundleIdInput = {
  fromChainId: number,
  bundleId: string
}

export type GetMessageIdsForBundleIdInput = {
  fromChainId: number,
  bundleId: string
}

export type GetMerkleProofForMessageIdInput = {
  messageIds: string[],
  targetMessageId: string
}

export type GetBundleProofFromMessageIdInput = {
  fromChainId: number,
  messageId: string
}

export type GetBundleProofFromTransactionHashInput = {
  fromChainId: number,
  transactionHash: string
}

export type GetRelayMessagePopulatedTxInput = {
  fromChainId: number,
  toChainId: number,
  fromAddress: string,
  toAddress: string,
  toCalldata: string,
  bundleProof: BundleProof
}

export class Hop {
  eventFetcher: EventFetcher
  network: string
  batchBlocks?: number
  contractAddresses: Record<string, any> = {
    mainnet: {},
    goerli: goerliAddresses
  }

  l1ChainId : number

  constructor (network: string = 'goerli', options?: Options) {
    if (!['mainnet', 'goerli'].includes(network)) {
      throw new Error(`Invalid network: ${network}`)
    }
    this.network = network

    if (this.network === 'mainnet') {
      this.l1ChainId = 1
    } else if (this.network === 'goerli') {
      this.l1ChainId = 5
    }

    if (options?.batchBlocks) {
      this.batchBlocks = options.batchBlocks
    }

    if (options?.contractAddresses) {
      this.contractAddresses[network] = options.contractAddresses
    }
  }

  get version () {
    return pkg.version
  }

  getRpcProvider (chainId: number) {
    return getProvider(this.network, chainId)
  }

  getSpokeMessageBridgeContractAddress (chainId: number): string {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    const address = this.contractAddresses[this.network]?.[chainId]?.spokeCoreMessenger
    return address
  }

  getHubMessageBridgeContractAddress (chainId: number): string {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    const address = this.contractAddresses[this.network]?.[chainId]?.hubCoreMessenger
    return address
  }

  async getBundleCommittedEvents (input: GetEventsInput): Promise<BundleCommitted[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new BundleCommittedEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getBundleForwardedEvents (input: GetEventsInput): Promise<BundleForwarded[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new BundleForwardedEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getBundleReceivedEvents (input: GetEventsInput): Promise<BundleReceived[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new BundleReceivedEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getBundleSetEvents (input: GetEventsInput): Promise<BundleSet[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new BundleSetEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getFeesSentToHubEvents (input: GetEventsInput): Promise<FeesSentToHub[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new FeesSentToHubEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getMessageBundledEvents (input: GetEventsInput): Promise<MessageBundled[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new MessageBundledEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getMessageRelayedEvents (input: GetEventsInput): Promise<MessageRelayed[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new MessageRelayedEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getMessageRevertedEvents (input: GetEventsInput): Promise<MessageReverted[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new MessageRevertedEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getMessageSentEvents (input: GetEventsInput): Promise<MessageSent[]> {
    const { chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${chainId}`)
    }
    const eventFetcher = new MessageSentEventFetcher(provider, chainId, this.batchBlocks, address)
    return eventFetcher.getEvents(fromBlock, toBlock)
  }

  async getEvents (input: GetGeneralEventsInput): Promise<any[]> {
    let { eventName, eventNames, chainId, fromBlock, toBlock } = input
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!fromBlock) {
      throw new Error('fromBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }

    if (eventName) {
      eventNames = [eventName]
    }

    if (!eventNames.length) {
      throw new Error('expected eventName or eventNames')
    }

    const filters :any[] = []
    const eventFetcher = new EventFetcher({
      provider,
      batchBlocks: this.batchBlocks
    })
    const map : any = {}
    for (const eventName of eventNames) {
      if (eventName === 'BundleCommitted') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new BundleCommittedEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'BundleForwared') {
        const address = this.getHubMessageBridgeContractAddress(chainId)
        const _eventFetcher = new BundleForwardedEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'BundleReceived') {
        const address = this.getHubMessageBridgeContractAddress(chainId)
        const _eventFetcher = new BundleReceivedEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'BundleSet') {
        const address = this.getHubMessageBridgeContractAddress(chainId)
        const _eventFetcher = new BundleSetEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'FeesSentToHub') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new FeesSentToHubEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'MessageBundled') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new MessageBundledEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'MessageRelayed') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new MessageRelayedEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'MessageReverted') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new MessageRevertedEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      } else if (eventName === 'MessageSent') {
        const address = this.getSpokeMessageBridgeContractAddress(chainId)
        const _eventFetcher = new MessageSentEventFetcher(provider, chainId, this.batchBlocks, address)
        const filter = _eventFetcher.getFilter()
        filters.push(filter)
        map[filter.topics[0] as string] = _eventFetcher
      }
    }
    const options = {
      fromBlock,
      toBlock
    }
    const events = await eventFetcher.fetchEvents(filters, options)
    const decoded : any[] = []
    for (const event of events) {
      const res = await map[event.topics[0] as string].populateEvents([event])
      decoded.push(...res)
    }
    return decoded
  }

  getEventNames (): string[] {
    return [
      'BundleCommitted',
      'BundleForwarded',
      'BundleReceived',
      'BundleSet',
      'FeesSentToHub',
      'MessageBundled',
      'MessageRelayed',
      'MessageReverted',
      'MessageSent'
    ]
  }

  async hasAuctionStarted (input: HasAuctionStartedInput): Promise<boolean> {
    const { fromChainId, bundleCommittedEvent } = input
    const { commitTime, toChainId } = bundleCommittedEvent
    const exitTime = await this.getSpokeExitTime({ fromChainId, toChainId })
    return commitTime + exitTime < DateTime.utc().toSeconds()
  }

  async getSpokeExitTime (input: GetSpokeExitTimeInput): Promise<number> {
    const { fromChainId, toChainId } = input
    const provider = this.getRpcProvider(toChainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${toChainId}`)
    }

    const address = this.getHubMessageBridgeContractAddress(toChainId)
    if (!address) {
      throw new Error(`Invalid chain: ${toChainId}`)
    }
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const exitTime = await hubMessageBridge.getSpokeExitTime(fromChainId)
    const exitTimeSeconds = exitTime.toNumber()
    return exitTimeSeconds
  }

  // relayReward = (block.timestamp - relayWindowStart) * feesCollected / relayWindow
  // reference: https://github.com/hop-protocol/contracts-v2/blob/master/contracts/bridge/FeeDistributor/FeeDistributor.sol#L83-L106
  async getRelayReward (input: GetRelayRewardInput): Promise<number> {
    const { fromChainId, bundleCommittedEvent } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainId}`)
    }
    const { commitTime, bundleFees, toChainId } = bundleCommittedEvent
    const feesCollected = Number(formatEther(bundleFees))
    const { timestamp: blockTimestamp } = await provider.getBlock('latest')
    const spokeExitTime = await this.getSpokeExitTime({ fromChainId, toChainId })
    const relayWindowStart = commitTime + spokeExitTime
    const relayWindow = this.getRelayWindowHours() * 60 * 60
    const relayReward = (blockTimestamp - relayWindowStart) * feesCollected / relayWindow
    return relayReward
  }

  async getEstimatedTxCostForForwardMessage (input: GetEstimatedTxCostForForwardMessageInput): Promise<number> {
    const { chainId } = input
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${chainId}`)
    }
    const estimatedGas = BigNumber.from(1_000_000) // TODO
    const gasPrice = await provider.getGasPrice()
    const estimatedTxCost = estimatedGas.mul(gasPrice)
    return Number(formatUnits(estimatedTxCost, 9))
  }

  async shouldAttemptForwardMessage (input: ShouldAttemptForwardMessageInput): Promise<boolean> {
    const { fromChainId, bundleCommittedEvent } = input
    const estimatedTxCost = await this.getEstimatedTxCostForForwardMessage({ chainId: fromChainId })
    const relayReward = await this.getRelayReward({ fromChainId, bundleCommittedEvent })
    const txOk = relayReward > estimatedTxCost
    const timeOk = await this.hasAuctionStarted({ fromChainId, bundleCommittedEvent })
    const shouldAttempt = txOk && timeOk
    return shouldAttempt
  }

  async getBundleExitPopulatedTx (input: GetBundleExitPopulatedTxInput): Promise<any> {
    let { fromChainId, bundleCommittedEvent, bundleCommittedTransactionHash } = input
    if (bundleCommittedTransactionHash) {
      if (!this.isValidTxHash(bundleCommittedTransactionHash)) {
        throw new Error(`Invalid transaction hash: ${bundleCommittedTransactionHash}`)
      }
    } else if (bundleCommittedEvent) {
      const { eventLog, context } = bundleCommittedEvent
      bundleCommittedTransactionHash = eventLog.transactionHash ?? context?.transactionHash
    }
    if (!bundleCommittedTransactionHash) {
      throw new Error('expected bundle comitted transaction hash')
    }

    const l1Provider = this.getRpcProvider(this.l1ChainId)
    const l2Provider = this.getRpcProvider(fromChainId)
    // TODO: generalize
    const exitRelayer = new OptimismRelayer(this.network, l1Provider, l2Provider)
    const txData = await exitRelayer.getExitPopulatedTx(bundleCommittedTransactionHash)

    return {
      ...txData,
      chainId: fromChainId
    }
  }

  async getSendMessagePopulatedTx (input: GetSendMessagePopulatedTxInput): Promise<any> {
    let { fromChainId, toChainId, toAddress, toCalldata = '0x' } = input
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    if (!toAddress) {
      throw new Error('toAddress is required')
    }
    if (!toCalldata) {
      toCalldata = '0x'
    }
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainId}`)
    }

    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    if (!address) {
      throw new Error(`Invalid address: ${fromChainId}`)
    }
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const txData = await spokeMessageBridge.populateTransaction.sendMessage(toChainId, toAddress, toCalldata)

    return {
      ...txData,
      chainId: fromChainId
    }
  }

  async getBlock (chainId: number, blockNumber: number): Promise<any> {
    const cacheKey = `${chainId}-${blockNumber}`
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }
    const provider = this.getRpcProvider(chainId)
    const block = await provider.getBlock(blockNumber)
    cache[cacheKey] = block
    return block
  }

  getChainSlug (chainId: number) {
    const chainSlug = chainSlugMap[chainId]
    if (!chainSlug) {
      throw new Error(`Invalid chain: ${chainId}`)
    }
    return chainSlug
  }

  // reference: https://github.com/hop-protocol/contracts-v2/blob/cdc3377d6a1f964554ba0e6e1fef0b504d43fc6a/contracts/bridge/FeeDistributor/FeeDistributor.sol#L42
  getRelayWindowHours (): number {
    return 12
  }

  async getRouteData (input: GetRouteDataInput) {
    const { fromChainId, toChainId } = input
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const provider = this.getRpcProvider(fromChainId)
    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const routeData = await spokeMessageBridge.routeData(toChainId)

    return {
      messageFee: routeData.messageFee,
      maxBundleMessages: routeData.maxBundleMessages.toNumber()
    }
  }

  async getMessageFee (input: GetMessageFeeInput) {
    const { fromChainId, toChainId } = input
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const routeData = await this.getRouteData({ fromChainId, toChainId })
    return routeData.messageFee
  }

  async getMaxBundleMessageCount (input: GetMaxBundleMessageCountInput) {
    const { fromChainId, toChainId } = input
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const routeData = await this.getRouteData({ fromChainId, toChainId })
    return routeData.maxBundleMessages
  }

  isValidTxHash (txHash: string): boolean {
    return txHash.slice(0, 2) === '0x' && txHash.length === 66
  }

  getContractAddresses () {
    return this.contractAddresses[this.network]
  }

  async getIsBundleSet (input: GetIsBundleSetInput) {
    const { fromChainId, toChainId, bundleId } = input
    const provider = this.getRpcProvider(toChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${toChainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(toChainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${toChainId}`)
    }
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const entity = await hubMessageBridge.bundles(bundleId)
    if (!entity) {
      return false
    }

    return BigNumber.from(entity.root).gt(0) && entity.fromChainId.toNumber() === fromChainId
  }

  async getMessageSentEventFromTransactionReceipt (input: GetMessageSentEventFromTransactionReceiptInput) {
    const { fromChainId, receipt } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${fromChainId}`)
    }
    const eventFetcher = new MessageSentEventFetcher(provider, fromChainId, this.batchBlocks, address)
    const filter = eventFetcher.getFilter()
    for (const log of receipt.logs) {
      if (log.topics[0] === filter.topics[0]) {
        const decoded = eventFetcher.toTypedEvent(log)
        return decoded
      }
    }
    return null
  }

  async getMessageSentEventFromTransactionHash (input: GetMessageSentEventFromTransactionHashInput) {
    const { fromChainId, transactionHash } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }
    const receipt = await provider.getTransactionReceipt(transactionHash)
    return this.getMessageSentEventFromTransactionReceipt({ fromChainId, receipt })
  }

  async getMessageBundledEventFromMessageId (input: GetMessageBundledEventFromMessageIdInput) {
    const { fromChainId, messageId } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }

    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${fromChainId}`)
    }

    const eventFetcher = new MessageBundledEventFetcher(provider, fromChainId, 1_000_000_000, address)
    const filter = eventFetcher.getMessageIdFilter(messageId)
    const toBlock = await provider.getBlockNumber()
    const fromBlock = 0 // endBlock - 100_000
    const events = await eventFetcher._getEvents(filter, fromBlock, toBlock)
    return events?.[0] ?? null
  }

  async getMessageBundledEventFromTransactionHash (input: GetMessageBundledEventFromTransactionHashInput) {
    const { fromChainId, transactionHash } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }
    const receipt = await provider.getTransactionReceipt(transactionHash)
    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${fromChainId}`)
    }
    const eventFetcher = new MessageBundledEventFetcher(provider, fromChainId, this.batchBlocks, address)
    const filter = eventFetcher.getFilter()
    for (const log of receipt.logs) {
      if (log.topics[0] === filter.topics[0]) {
        const decoded = eventFetcher.toTypedEvent(log)
        return decoded
      }
    }
    return null
  }

  async getMessageIdFromTransactionHash (input: GetMessageIdFromTransactionHashInput) {
    const { fromChainId, transactionHash } = input
    const event = await this.getMessageSentEventFromTransactionHash({ fromChainId, transactionHash })
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.messageId
  }

  async getMessageBundleIdFromMessageId (input: GetMessageBundleIdFromMessageIdInput): Promise<string> {
    const { fromChainId, messageId } = input
    const event = await this.getMessageBundledEventFromMessageId({ fromChainId, messageId })
    if (!event) {
      throw new Error('event not found for messageId')
    }

    return event.bundleId
  }

  async getMessageBundleIdFromTransactionHash (input: GetMessageBundleIdFromTransactionHashInput): Promise<string> {
    const { fromChainId, transactionHash } = input
    const event = await this.getMessageBundledEventFromTransactionHash({ fromChainId, transactionHash })
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.bundleId
  }

  async getMessageTreeIndexFromMessageId (input: GetMessageTreeIndexFromMessageIdInput): Promise<number> {
    const { fromChainId, messageId } = input
    const event = await this.getMessageBundledEventFromMessageId({ fromChainId, messageId })
    if (!event) {
      throw new Error('event not found for messageId')
    }

    return event.treeIndex
  }

  async getMessageTreeIndexFromTransactionHash (input: GetMessageTreeIndexFromTransactionHashInput): Promise<number> {
    const { fromChainId, transactionHash } = input
    const event = await this.getMessageBundledEventFromTransactionHash({ fromChainId, transactionHash })
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.treeIndex
  }

  async getMessageBundledEventsForBundleId (input: GetMessageBundledEventsForBundleIdInput): Promise<any[]> {
    const { fromChainId, bundleId } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(fromChainId)
    if (!address) {
      throw new Error(`Contract address not found for chainId: ${fromChainId}`)
    }
    const eventFetcher = new MessageBundledEventFetcher(provider, fromChainId, 1_000_000_000, address)
    const filter = eventFetcher.getBundleIdFilter(bundleId)
    const toBlock = await provider.getBlockNumber()
    const fromBlock = 0 // endBlock - 100_000
    const events = eventFetcher._getEvents(filter, fromBlock, toBlock)
    return events
  }

  async getMessageIdsForBundleId (input: GetMessageIdsForBundleIdInput): Promise<string[]> {
    const { fromChainId, bundleId } = input
    const messageEvents = await this.getMessageBundledEventsForBundleId({ fromChainId, bundleId })
    const messageIds = messageEvents.map((item: any) => item.messageId)
    return messageIds
  }

  getMerkleProofForMessageId (input: GetMerkleProofForMessageIdInput) {
    const { messageIds, targetMessageId } = input
    if (!targetMessageId) {
      throw new Error('targetMessageId is required')
    }

    const tree = MerkleTree.from(messageIds)
    const proof = tree.getHexProof(targetMessageId)
    return proof
  }

  async getBundleProofFromMessageId (input: GetBundleProofFromMessageIdInput): Promise<BundleProof> {
    const { fromChainId, messageId } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }

    if (!messageId) {
      throw new Error('messageId is required')
    }

    const { treeIndex, bundleId } = await this.getMessageBundledEventFromMessageId({ fromChainId, messageId })
    const messageIds = await this.getMessageIdsForBundleId({ fromChainId, bundleId })
    const siblings = this.getMerkleProofForMessageId({ messageIds, targetMessageId: messageId })
    const totalLeaves = messageIds.length

    return {
      bundleId,
      treeIndex,
      siblings,
      totalLeaves
    }
  }

  async getBundleProofFromTransactionHash (input: GetBundleProofFromTransactionHashInput): Promise<BundleProof> {
    const { fromChainId, transactionHash } = input
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }

    // TODO: handle case for when multiple message events in single transaction
    const { treeIndex, bundleId } = await this.getMessageBundledEventFromTransactionHash({ fromChainId, transactionHash })
    const targetMessageId = await this.getMessageIdFromTransactionHash({ fromChainId, transactionHash })
    const messageIds = await this.getMessageIdsForBundleId({ fromChainId, bundleId })
    const siblings = this.getMerkleProofForMessageId({ messageIds, targetMessageId })
    const totalLeaves = messageIds.length

    return {
      bundleId,
      treeIndex,
      siblings,
      totalLeaves
    }
  }

  async getRelayMessagePopulatedTx (input: GetRelayMessagePopulatedTxInput) {
    const { fromChainId, toChainId, fromAddress, toAddress, toCalldata, bundleProof } = input
    const provider = this.getRpcProvider(toChainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${toChainId}`)
    }

    const address = this.getHubMessageBridgeContractAddress(toChainId)
    if (!address) {
      throw new Error(`Invalid chain: ${toChainId}`)
    }

    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const txData = await hubMessageBridge.populateTransaction.relayMessage(
      fromChainId,
      fromAddress,
      toAddress,
      toCalldata,
      bundleProof
    )

    return {
      ...txData,
      chainId: toChainId
    }
  }
}
