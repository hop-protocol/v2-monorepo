import pkg from '../package.json'
import { BigNumber, providers } from 'ethers'
import { BundleCommitted, BundleCommittedEventFetcher } from './events/BundleCommitted'
import { BundleForwarded, BundleForwardedEventFetcher } from './events/BundleForwarded'
import { BundleReceived, BundleReceivedEventFetcher } from './events/BundleReceived'
import { BundleSet, BundleSetEventFetcher } from './events/BundleSet'
import { DateTime } from 'luxon'
import { EventContext } from './events/types'
import { EventFetcher } from './eventFetcher'
import { FeesSentToHub, FeesSentToHubEventFetcher } from './events/FeesSentToHub'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'
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

type Options = {
  batchBlocks?: number,
  contractAddresses?: Record<string, any>
}

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>
  network: string
  batchBlocks?: number
  contractAddresses: Record<string, any> = {
    mainnet: {},
    goerli: goerliAddresses
  }

  constructor (network: string = 'goerli', options?: Options) {
    if (!['mainnet', 'goerli'].includes(network)) {
      throw new Error(`Invalid network: ${network}`)
    }
    this.network = network
    this.providers = {
      ethereum: getProvider(network, 'ethereum'),
      optimism: getProvider(network, 'optimism'),
      arbitrum: getProvider(network, 'arbitrum'),
      polygon: getProvider(network, 'polygon')
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

  getSpokeMessageBridgeContractAddress (chain: string): string {
    if (!chain) {
      throw new Error('chain is required')
    }
    const address = this.contractAddresses[this.network]?.[chain]?.spokeCoreMessenger
    return address
  }

  getHubMessageBridgeContractAddress (chain: string): string {
    if (!chain) {
      throw new Error('chain is required')
    }
    const address = this.contractAddresses[this.network]?.[chain]?.hubCoreMessenger
    return address
  }

  async getBundleCommittedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleCommitted[]> {
    if (!chainId) {
      throw new Error('chainId is required')
    }
    if (!startBlock) {
      throw new Error('startBlock is required')
    }
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Provider not found for chainId: ${chainId}`)
    }

    if (Array.isArray(eventNames)) {
      // TODO
      /*
      const filters :any[] = []
      const eventFetcher = new EventFetcher({
        provider
      })
      for (const eventName of eventNames) {
        if (eventName === 'BundleCommitted') {
          const address = this.getSpokeMessageBridgeContractAddress(chain)
          const filter = {
            address,
            topics: [

            ]
          }
        }
        filters.push(filter)
      }
      const options = {
        startBlock,
        endBlock
      }
      const events = await eventFetcher.fetchEvents(filters, options)
      const decoded : any[] = []
      for (const event of events) {
        decoded.push(event)
      }
      return decoded
      */
    } else {
      const eventName = eventNames
      switch (eventName) {
        case 'BundleCommitted':
          return this.getBundleCommittedEvents(chainId, startBlock, endBlock)
        case 'BundleForwarded':
          return this.getBundleForwardedEvents(chainId, startBlock, endBlock)
        case 'BundleReceived':
          return this.getBundleReceivedEvents(chainId, startBlock, endBlock)
        case 'BundleSet':
          return this.getBundleSetEvents(chainId, startBlock, endBlock)
        case 'FeesSentToHub':
          return this.getFeesSentToHubEvents(chainId, startBlock, endBlock)
        case 'MessageBundled':
          return this.getMessageBundledEvents(chainId, startBlock, endBlock)
        case 'MessageRelayed':
          return this.getMessageRelayedEvents(chainId, startBlock, endBlock)
        case 'MessageReverted':
          return this.getMessageRevertedEvents(chainId, startBlock, endBlock)
        case 'MessageSent':
          return this.getMessageSentEvents(chainId, startBlock, endBlock)
        default:
          throw new Error(`Invalid event name: ${eventName}`)
      }
    }
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
    const toChainSlug = this.getChainSlug(toChainId)
    const provider = this.providers[toChainSlug]
    if (!provider) {
      throw new Error(`Invalid chain: ${toChainId}`)
    }

    const address = this.getHubMessageBridgeContractAddress(toChainSlug)
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const exitTime = await hubMessageBridge.getSpokeExitTime(fromChainId)
    const exitTimeSeconds = exitTime.toNumber()
    return exitTimeSeconds
  }

  // relayReward = (block.timestamp - relayWindowStart) * feesCollected / relayWindow
  // reference: https://github.com/hop-protocol/contracts-v2/blob/master/contracts/bridge/FeeDistributor/FeeDistributor.sol#L83-L106
  async getRelayReward (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<number> {
    const fromChainSlug = this.getChainSlug(fromChainId)
    const provider = this.providers[fromChainSlug]
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainSlug}`)
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
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
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
      const { _event, context } = bundleCommittedEventOrTxHash
      transactionHash = _event.transactionHash ?? context?.transactionHash
    }
    if (!transactionHash) {
      throw new Error('expected transaction hash')
    }

    const exitRelayer = new OptimismRelayer(this.network, this.providers.ethereum, this.providers.optimism)
    const txData = await exitRelayer.getExitPopulatedTx(transactionHash)

    return {
      ...txData,
      chainId: fromChainId
    }
  }

  async getSendMessagePopulatedTx (fromChainId: number, toChainId: number, toAddress: string, toCalldata: string): Promise<any> {
    if (fromChainId === toChainId) {
      throw new Error('fromChainId and toChainId must be different')
    }
    const fromChainSlug = this.getChainSlug(fromChainId)
    const provider = this.providers[fromChainSlug]
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainId}`)
    }

    const address = this.getSpokeMessageBridgeContractAddress(fromChainSlug)
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
    const { timestamp: blockTimestamp } = await this.getBlock(chainSlug, blockNumber)

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

  async getBlock (chainSlug: string, blockNumber: number): Promise<any> {
    const cacheKey = `${chainSlug}-${blockNumber}`
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }
    const block = await this.providers[chainSlug].getBlock(blockNumber)
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
    const chain = this.getChainSlug(fromChainId)
    const provider = this.providers[chain]
    const address = this.getSpokeMessageBridgeContractAddress(chain)
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
}
