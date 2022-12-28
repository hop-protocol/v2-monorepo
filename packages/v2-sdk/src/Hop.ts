import pkg from '../package.json'
import { BigNumber } from 'ethers'
import { BundleCommitted, BundleCommittedEventFetcher } from './events/BundleCommitted'
import { BundleForwarded, BundleForwardedEventFetcher } from './events/BundleForwarded'
import { BundleReceived, BundleReceivedEventFetcher } from './events/BundleReceived'
import { BundleSet, BundleSetEventFetcher } from './events/BundleSet'
import { DateTime } from 'luxon'
import { EventContext } from './events/types'
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

  async getBundleCommittedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleCommitted[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getBundleForwardedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleForwarded[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getBundleReceivedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleReceived[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getBundleSetEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleSet[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getFeesSentToHubEvents (chainId: number, startBlock: number, endBlock?: number): Promise<FeesSentToHub[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getMessageBundledEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageBundled[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getMessageRelayedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageRelayed[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getMessageRevertedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageReverted[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getMessageSentEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageSent[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
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
    return eventFetcher.getEvents(startBlock, endBlock)
  }

  async getEvents (eventNames: string | string[], chainId: number, startBlock: number, endBlock?: number): Promise<any[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
    }
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }

    if (!Array.isArray(eventNames)) {
      eventNames = [eventNames]
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
      startBlock,
      endBlock
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

  async hasAuctionStarted (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<boolean> {
    const { commitTime, toChainId } = bundleCommittedEvent
    const exitTime = await this.getSpokeExitTime(fromChainId, toChainId)
    return commitTime + exitTime < DateTime.utc().toSeconds()
  }

  async getSpokeExitTime (fromChainId: number, toChainId: number) {
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
  async getRelayReward (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<number> {
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainId}`)
    }
    const { commitTime, bundleFees, toChainId } = bundleCommittedEvent
    const feesCollected = Number(formatEther(bundleFees))
    const { timestamp: blockTimestamp } = await provider.getBlock('latest')
    const spokeExitTime = await this.getSpokeExitTime(fromChainId, toChainId)
    const relayWindowStart = commitTime + spokeExitTime
    const relayWindow = this.getRelayWindowHours() * 60 * 60
    const relayReward = (blockTimestamp - relayWindowStart) * feesCollected / relayWindow
    return relayReward
  }

  async getEstimatedTxCostForForwardMessage (chainId: number, bundleCommittedEvent: BundleCommitted): Promise<number> {
    const provider = this.getRpcProvider(chainId)
    if (!provider) {
      throw new Error(`Invalid chain: ${chainId}`)
    }
    const estimatedGas = BigNumber.from(1_000_000) // TODO
    const gasPrice = await provider.getGasPrice()
    const estimatedTxCost = estimatedGas.mul(gasPrice)
    return Number(formatUnits(estimatedTxCost, 9))
  }

  async shouldAttemptForwardMessage (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<boolean> {
    const estimatedTxCost = await this.getEstimatedTxCostForForwardMessage(fromChainId, bundleCommittedEvent)
    const relayReward = await this.getRelayReward(fromChainId, bundleCommittedEvent)
    const txOk = relayReward > estimatedTxCost
    const timeOk = await this.hasAuctionStarted(fromChainId, bundleCommittedEvent)
    const shouldAttempt = txOk && timeOk
    return shouldAttempt
  }

  async getBundleExitPopulatedTx (fromChainId: number, bundleCommittedEventOrTxHash: BundleCommitted | string): Promise<any> {
    let transactionHash = ''
    if (typeof bundleCommittedEventOrTxHash === 'string') {
      transactionHash = bundleCommittedEventOrTxHash
      if (!this.isValidTxHash(transactionHash)) {
        throw new Error(`Invalid transaction hash: ${transactionHash}`)
      }
    } else {
      const { eventLog, context } = bundleCommittedEventOrTxHash
      transactionHash = eventLog.transactionHash ?? context?.transactionHash
    }
    if (!transactionHash) {
      throw new Error('expected transaction hash')
    }

    const l1Provider = this.getRpcProvider(this.l1ChainId)
    const l2Provider = this.getRpcProvider(fromChainId)
    const exitRelayer = new OptimismRelayer(this.network, l1Provider, l2Provider)
    const txData = await exitRelayer.getExitPopulatedTx(transactionHash)

    return {
      ...txData,
      chainId: fromChainId
    }
  }

  async getSendMessagePopulatedTx (fromChainId: number, toChainId: number, toAddress: string, toCalldata: string = '0x'): Promise<any> {
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

  async getEventContext (event: any, chainId: number): Promise<EventContext> {
    const chainSlug = this.getChainSlug(chainId)
    const transactionHash = event.transactionHash
    const transactionIndex = event.transactionIndex
    const logIndex = event.logIndex
    const blockNumber = event.blockNumber
    const { timestamp: blockTimestamp } = await this.getBlock(chainId, blockNumber)

    return {
      chainSlug,
      chainId,
      transactionHash,
      transactionIndex,
      logIndex,
      blockNumber,
      blockTimestamp
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

  async getRouteData (fromChainId: number, toChainId: number) {
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

  async getMessageFee (fromChainId: number, toChainId: number) {
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const routeData = await this.getRouteData(fromChainId, toChainId)
    return routeData.messageFee
  }

  async getMaxBundleMessageCount (fromChainId: number, toChainId: number) {
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const routeData = await this.getRouteData(fromChainId, toChainId)
    return routeData.maxBundleMessages
  }

  isValidTxHash (txHash: string): boolean {
    return txHash.slice(0, 2) === '0x' && txHash.length === 66
  }

  getContractAddresses () {
    return this.contractAddresses[this.network]
  }

  async getIsBundleSet (fromChainId: number, toChainId: number, bundleId: string) {
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

  async getMessageSentEventFromTransactionReceipt (fromChainId: number, receipt: any) {
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

  async getMessageSentEventFromTransactionHash (fromChainId: number, transactionHash: string) {
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }
    const receipt = await provider.getTransactionReceipt(transactionHash)
    return this.getMessageSentEventFromTransactionReceipt(fromChainId, receipt)
  }

  async getMessageBundledEventFromMessageId (fromChainId: number, messageId: string) {
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
    const endBlock = await provider.getBlockNumber()
    const startBlock = 0 // endBlock - 100_000
    const events = await eventFetcher._getEvents(filter, startBlock, endBlock)
    return events?.[0] ?? null
  }

  async getMessageBundledEventFromTransactionHash (fromChainId: number, transactionHash: string) {
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

  async getMessageIdFromTransactionHash (fromChainId: number, transactionHash: string) {
    const event = await this.getMessageSentEventFromTransactionHash(fromChainId, transactionHash)
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.messageId
  }

  async getMessageBundleIdFromMessageId (fromChainId: number, messageId: string): Promise<string> {
    const event = await this.getMessageBundledEventFromMessageId(fromChainId, messageId)
    if (!event) {
      throw new Error('event not found for messageId')
    }

    return event.bundleId
  }

  async getMessageBundleIdFromTransactionHash (fromChainId: number, transactionHash: string): Promise<string> {
    const event = await this.getMessageBundledEventFromTransactionHash(fromChainId, transactionHash)
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.bundleId
  }

  async getMessageTreeIndexFromMessageId (fromChainId: number, messageId: string): Promise<number> {
    const event = await this.getMessageBundledEventFromMessageId(fromChainId, messageId)
    if (!event) {
      throw new Error('event not found for messageId')
    }

    return event.treeIndex
  }

  async getMessageTreeIndexFromTransactionHash (fromChainId: number, transactionHash: string): Promise<number> {
    const event = await this.getMessageBundledEventFromTransactionHash(fromChainId, transactionHash)
    if (!event) {
      throw new Error('event not found for transaction hash')
    }

    return event.treeIndex
  }

  async getMessageBundledEventsForBundleId (fromChainId: number, bundleId: string): Promise<any[]> {
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
    const endBlock = await provider.getBlockNumber()
    const startBlock = 0 // endBlock - 100_000
    const events = eventFetcher._getEvents(filter, startBlock, endBlock)
    return events
  }

  async getMessageIdsForBundleId (fromChainId: number, bundleId: string): Promise<string[]> {
    const messageEvents = await this.getMessageBundledEventsForBundleId(fromChainId, bundleId)
    const messageIds = messageEvents.map((item: any) => item.messageId)
    return messageIds
  }

  getMerkleProofForMessageId (messageIds: string[], messageId: string) {
    const tree = MerkleTree.from(messageIds)
    const proof = tree.getHexProof(messageId)
    return proof
  }

  async getBundleProofFromMessageId (fromChainId: number, messageId: string): Promise<BundleProof> {
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }

    const { treeIndex, bundleId } = await this.getMessageBundledEventFromMessageId(fromChainId, messageId)
    const messageIds = await this.getMessageIdsForBundleId(fromChainId, bundleId)
    const siblings = this.getMerkleProofForMessageId(messageIds, messageId)
    const totalLeaves = messageIds.length

    return {
      bundleId,
      treeIndex,
      siblings,
      totalLeaves
    }
  }

  async getBundleProofFromTransactionHash (fromChainId: number, transactionHash: string): Promise<BundleProof> {
    const provider = this.getRpcProvider(fromChainId)
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${fromChainId}`)
    }

    // TODO: handle case for when multiple message events in single transaction
    const { treeIndex, bundleId } = await this.getMessageBundledEventFromTransactionHash(fromChainId, transactionHash)
    const messageId = await this.getMessageIdFromTransactionHash(fromChainId, transactionHash)
    const messageIds = await this.getMessageIdsForBundleId(fromChainId, bundleId)
    const siblings = this.getMerkleProofForMessageId(messageIds, messageId)
    const totalLeaves = messageIds.length

    return {
      bundleId,
      treeIndex,
      siblings,
      totalLeaves
    }
  }

  async getRelayMessagePopulatedTx (fromChainId: number, toChainId: number, fromAddress: string, toAddress: string, toCalldata: string, bundleProof: BundleProof) {
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
