import pkg from '../package.json'
import { BigNumber, providers } from 'ethers'
import { DateTime } from 'luxon'
import { EventFetcher, InputFilter } from './eventFetcher'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { formatUnits } from 'ethers/lib/utils'
import { getProvider } from './utils/getProvider'

type BundleCommitted = {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>

  constructor (network: string = 'goerli') {
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
    const address = '0x0000000000000000000000000000000000000000' // TODO
    return address
  }

  getHubMessageBridgeContractAddress (chain: string): string {
    const address = '0x0000000000000000000000000000000000000000' // TODO
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
      commitTime
    }
  }

  watchForBunedleCommittedEvents (chain: string, callback: (event: any) => void) {
    const provider = this.providers[chain]
    if (!provider) {
      throw new Error(`Invalid chain: ${chain}`)
    }

    // TODO
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

  // reference: https://github.com/hop-protocol/contracts-v2/blob/cdc3377d6a1f964554ba0e6e1fef0b504d43fc6a/contracts/bridge/FeeDistributor/FeeDistributor.sol#L42
  getRelayWindowHours (): number {
    return 12
  }
}
