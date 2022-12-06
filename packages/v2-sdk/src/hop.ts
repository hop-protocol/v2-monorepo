import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import pkg from '../package.json'
import { BigNumber, ethers, providers } from 'ethers'
import { BundleCommittedEvent, FeesSentToHubEvent, MessageBundledEvent, MessageSentEvent } from '@hop-protocol/v2-core/contracts/SpokeMessageBridge'
import { DateTime } from 'luxon'
import { EventFetcher, InputFilter } from './eventFetcher'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'
import { OptimismRelayer } from './exitRelayers/OptimismRelayer'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { getProvider } from './utils/getProvider'

const contractAddresses: Record<string, any> = {
  goerli: {
    ethereum: {
      hubCoreMessenger: '0x9827315F7D2B1AAd0aa4705c06dafEE6cAEBF920',
      ethFeeDistributor: '0x8fF09Ff3C87085Fe4607F2eE7514579FE50944C5'
    },
    optimism: {
      spokeCoreMessenger: '0x4b844c25ef430e71d42eea89d87ffe929f8db927',
      hubMessageBridge: '0x342EA1227fC0e085704D30cd17a16cA98B58D08B'
    }
  }
}

const cache : Record<string, any> = {}

export type EventContext = {
  chainSlug: string
  chainId: number
  transactionHash: string
  transactionIndex: number
  logIndex: number
  blockNumber: number
  blockTimestamp: number
}

type EventBase = {
  _event: any
  context?: EventContext
}

// event from SpokeMessageBridge
interface BundleCommitted extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

// event from SpokeMessageBridge
interface MessageBundled extends EventBase {
  bundleId: string
  treeIndex: number
  messageId: string
}

// event from SpokeMessageBridge
interface MessageSent extends EventBase {
  messageId: string
  from: string
  toChainId: number
  to: string
  data: string
}

// event from SpokeMessageBridge
interface FeesSentToHub extends EventBase {
  amount: BigNumber
}

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>
  network: string

  chainSlugMap: Record<string, string> = {
    1: 'ethereum', // mainnet
    5: 'ethereum', // goerli
    10: 'optimism', // mainnet
    420: 'optimism', // goerli
    42161: 'arbitrum', // mainnet
    421613: 'arbitrum', // goerli
    137: 'polygon', // mainnet
    80001: 'polygon' // goerli
  }

  constructor (network: string = 'goerli') {
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
  }

  get version () {
    return pkg.version
  }

  getSpokeMessageBridgeContractAddress (chain: string): string {
    const address = contractAddresses[this.network]?.[chain]?.spokeCoreMessenger
    return address
  }

  getHubMessageBridgeContractAddress (chain: string): string {
    const address = contractAddresses[this.network]?.[chain]?.hubCoreMessenger
    return address
  }

  async getMessageSentEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageSent[]> {
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const filter = spokeMessageBridge.filters.MessageSent()
    const eventFetcher = new EventFetcher({
      provider
    })
    if (!endBlock) {
      endBlock = await provider.getBlockNumber()
    }
    let events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    events = events.map(this.messageSentEventToTypedEvent)
    return Promise.all(events.map((event: any) => this.addContextToEvent(event, chainId)))
  }

  messageSentEventToTypedEvent (event: MessageSentEvent): MessageSent {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(event)

    const messageId = decoded.args.messageId.toString()
    const from = decoded.args.from
    const toChainId = decoded.args.toChainId.toNumber()
    const to = decoded.args.to
    const data = decoded.args.data

    return {
      messageId,
      from,
      toChainId,
      to,
      data,
      _event: event
    }
  }

  async getMessageBundledEvents (chainId: number, startBlock: number, endBlock?: number): Promise<MessageBundled[]> {
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const filter = spokeMessageBridge.filters.MessageBundled()
    const eventFetcher = new EventFetcher({
      provider
    })
    if (!endBlock) {
      endBlock = await provider.getBlockNumber()
    }
    let events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    events = events.map(this.messageBundledEventToTypedEvent)
    return Promise.all(events.map((event: any) => this.addContextToEvent(event, chainId)))
  }

  messageBundledEventToTypedEvent (event: MessageBundledEvent): MessageBundled {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(event)

    const bundleId = decoded.args.bundleId.toString()
    const treeIndex = decoded.args.treeIndex.toNumber()
    const messageId = decoded.args.messageId.toString()
    return {
      bundleId,
      treeIndex,
      messageId,
      _event: event
    }
  }

  async getBundleCommittedEvents (chainId: number, startBlock: number, endBlock?: number): Promise<BundleCommitted[]> {
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const filter = spokeMessageBridge.filters.BundleCommitted()
    const eventFetcher = new EventFetcher({
      provider
    })
    if (!endBlock) {
      endBlock = await provider.getBlockNumber()
    }
    let events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    events = events.map(this.bundleCommittedEventToTypedEvent)
    return Promise.all(events.map((event: any) => this.addContextToEvent(event, chainId)))
  }

  async addContextToEvent (event: any, chainId: number): Promise<any> {
    const context = await this.getEventContext(event._event, chainId)
    event.context = context
    return event
  }

  bundleCommittedEventToTypedEvent (event: BundleCommittedEvent): BundleCommitted {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(event)

    const bundleId = decoded.args.bundleId.toString()
    const bundleRoot = decoded.args.bundleRoot.toString()
    const bundleFees = decoded.args.bundleFees
    const toChainId = decoded.args.toChainId.toNumber()
    const commitTime = decoded.args.commitTime.toNumber()
    return {
      bundleId,
      bundleRoot,
      bundleFees,
      toChainId,
      commitTime,
      _event: event
    }
  }

  async getFeesSentToHubEvents (chainId: number, startBlock: number, endBlock?: number): Promise<FeesSentToHub[]> {
    const chain = this.getChainSlug(chainId)
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(chain)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const filter = spokeMessageBridge.filters.FeesSentToHub()
    const eventFetcher = new EventFetcher({
      provider
    })
    if (!endBlock) {
      endBlock = await provider.getBlockNumber()
    }
    let events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    events = events.map(this.feesSentToHubToTypedEvent)
    return Promise.all(events.map((event: any) => this.addContextToEvent(event, chainId)))
  }

  feesSentToHubToTypedEvent (event: FeesSentToHubEvent): FeesSentToHub {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(event)

    const amount = decoded.args.amount
    return {
      amount,
      _event: event
    }
  }

  async hasAuctionStarted (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<boolean> {
    const { commitTime, toChainId } = bundleCommittedEvent
    const exitTime = await this.getSpokeExitTime(fromChainId, toChainId)
    return commitTime + exitTime > DateTime.utc().toSeconds()
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

  async getBundleExitPopulatedTx (fromChainId: number, bundleCommittedEvent: BundleCommitted): Promise<any> {
    const { _event } = bundleCommittedEvent
    const transactionHash = _event.transactionHash
    const exitRelayer = new OptimismRelayer(this.network, this.providers.ethereum, this.providers.optimism)
    return exitRelayer.getExitPopulatedTx(transactionHash)
  }

  async getSendMessagePopulatedTx (fromChainId: number, toChainId: number, toAddress: string, toCalldata: string): Promise<any> {
    const fromChainSlug = this.getChainSlug(fromChainId)
    const provider = this.providers[fromChainSlug]
    if (!provider) {
      throw new Error(`Invalid chain: ${fromChainId}`)
    }
    const address = this.getSpokeMessageBridgeContractAddress(fromChainSlug)
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    const txData = await spokeMessageBridge.populateTransaction.sendMessage(toChainId, toAddress, toCalldata)
    return txData
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
    const chainSlug = this.chainSlugMap[chainId]
    if (!chainSlug) {
      throw new Error(`Invalid chain: ${chainId}`)
    }
    return chainSlug
  }

  // reference: https://github.com/hop-protocol/contracts-v2/blob/cdc3377d6a1f964554ba0e6e1fef0b504d43fc6a/contracts/bridge/FeeDistributor/FeeDistributor.sol#L42
  getRelayWindowHours (): number {
    return 12
  }
}
