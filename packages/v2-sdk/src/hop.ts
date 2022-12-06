import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import pkg from '../package.json'
import { BigNumber, ethers, providers } from 'ethers'
import { DateTime } from 'luxon'
import { EventFetcher, InputFilter } from './eventFetcher'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { formatUnits } from 'ethers/lib/utils'
import { getProvider } from './utils/getProvider'

const contractAddresses: Record<string, any> = {
  goerli: {
    ethereum: {
      hubCoreMessenger: '0x9827315F7D2B1AAd0aa4705c06dafEE6cAEBF920',
      ethFeeDistributor: '0x8fF09Ff3C87085Fe4607F2eE7514579FE50944C5'
    },
    optimism: {
      spokeCoreMessenger: '0x4b844c25ef430e71d42eea89d87ffe929f8db927'
    }
  }
}

type EventBase = {
  _event: any
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

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>
  network: string

  chainSlugMap: Record<string, string> = {
    1: 'ethereum',
    5: 'ethereum', // goerli
    10: 'optimism',
    420: 'optimism', // goerli
    421613: 'arbitrum', // goerli
    42161: 'arbitrum',
    137: 'polygon',
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

  async getBundleCommittedEvents (chain: string, startBlock: number, endBlock?: number): Promise<BundleCommitted[]> {
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
    const events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    return events.map(this.bundleCommittedEventToTypedEvent)
  }

  bundleCommittedEventToTypedEvent (event: any): BundleCommitted {
    const bundleId = event.args.bundleId.toString()
    const bundleRoot = event.args.bundleRoot.toHexString()
    const bundleFees = event.args.bundleFees
    const toChainId = event.args.toChainId.toNumber()
    const commitTime = event.args.commitTime.toNumber()
    return {
      bundleId,
      bundleRoot,
      bundleFees,
      toChainId,
      commitTime,
      _event: event
    }
  }

  async getMessageSentEvents (chain: string, startBlock: number, endBlock?: number): Promise<MessageSent[]> {
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
    const events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    return events.map(this.messageSentEventToTypedEvent)
  }

  messageSentEventToTypedEvent (event: any): MessageSent {
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

  watchForBunedleCommittedEvents (chain: string, callback: (event: any) => void) {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }

    // TODO
  }

  async getMessageBundledEvents (chain: string, startBlock: number, endBlock?: number): Promise<MessageBundled[]> {
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
    const events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    return events.map(this.messageBundledEventToTypedEvent)
  }

  messageBundledEventToTypedEvent (event: any): MessageBundled {
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

  async hasAuctionStarted (chain: string, bundleCommittedEvent: BundleCommitted): Promise<boolean> {
    const { commitTime, toChainId } = bundleCommittedEvent
    const exitTime = await this.getSpokeExitTime(chain, toChainId)
    return commitTime + exitTime > DateTime.utc().toSeconds()
  }

  async getSpokeExitTime (chain: string, chainId: number) {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }

    const address = this.getHubMessageBridgeContractAddress(chain)
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const exitTime = await hubMessageBridge.getSpokeExitTime(chainId)
    const exitTimeSeconds = exitTime.toNumber()
    return exitTimeSeconds
  }

  // relayReward = (block.timestamp - relayWindowStart) * feesCollected / relayWindow
  // reference: https://github.com/hop-protocol/contracts-v2/blob/master/contracts/bridge/FeeDistributor/FeeDistributor.sol#L83-L106
  async getRelayReward (chain: string, bundleCommittedEvent: BundleCommitted): Promise<number> {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const { commitTime, bundleFees, toChainId } = bundleCommittedEvent
    const feesCollected = Number(formatUnits(bundleFees, 18))
    const { timestamp: blockTimestamp } = await provider.getBlock('latest')
    const relayWindowStart = commitTime + await this.getSpokeExitTime(chain, toChainId)
    const relayWindow = this.getRelayWindowHours() * 60 * 60
    const relayReward = (blockTimestamp - relayWindowStart) * feesCollected / relayWindow
    return relayReward
  }

  async getEstimatedTxCostForForwardMessage (chain: string, bundleCommittedEvent: BundleCommitted): Promise<number> {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chain)
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const estimatedGas = await hubMessageBridge.estimateGas.receiveOrForwardMessageBundle(
      bundleCommittedEvent.bundleId,
      bundleCommittedEvent.bundleRoot,
      bundleCommittedEvent.bundleFees,
      bundleCommittedEvent.toChainId,
      bundleCommittedEvent.commitTime
    )
    const gasPrice = await provider.getGasPrice()
    const estimatedTxCost = estimatedGas.mul(gasPrice)
    return Number(formatUnits(estimatedTxCost, 18))
  }

  async shouldAttemptForwardMessage (chain: string, bundleCommittedEvent: BundleCommitted): Promise<boolean> {
    const estimatedTxCost = await this.getEstimatedTxCostForForwardMessage(chain, bundleCommittedEvent)
    const relayReward = await this.getRelayReward(chain, bundleCommittedEvent)
    const txOk = relayReward > estimatedTxCost
    const timeOk = await this.hasAuctionStarted(chain, bundleCommittedEvent)
    const shouldAttempt = txOk && timeOk
    return shouldAttempt
  }

  async attemptForwardMessage (chain: string, bundleCommittedEvent: BundleCommitted): Promise<any> {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }
    const address = this.getHubMessageBridgeContractAddress(chain)
    const hubMessageBridge = HubMessageBridge__factory.connect(address, provider)
    const tx = await hubMessageBridge.receiveOrForwardMessageBundle(
      bundleCommittedEvent.bundleId,
      bundleCommittedEvent.bundleRoot,
      bundleCommittedEvent.bundleFees,
      bundleCommittedEvent.toChainId,
      bundleCommittedEvent.commitTime
    )
    return tx
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
