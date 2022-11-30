import pkg from '../package.json'
import { EventFetcher } from './eventFetcher'
import { BigNumber, providers } from 'ethers'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>

  constructor () {
    this.providers = {}
  }

  get version () {
    return pkg.version
  }

  async getBundleCommittedEvents (startBlock: number, endBlock?: number): Promise<any[]> {
    const address = ''
    const provider = this.providers.ethereum
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(address, provider)
    console.log(spokeMessageBridge)
    // TODO
    return []
  }

  watchForBunedleCommittedEvents (callback: (event: any) => void) {
    // TODO
  }

  // relayReward = (block.timestamp - relayWindowStart) * feesCollected / relayWindow
  async getRelayerReward (): Promise<BigNumber> {
    // TODO
    return BigNumber.from(0)
  }

  async getEstimatedTxCostForForwardMessage (): Promise<BigNumber> {
    // TODO
    return BigNumber.from(0)
  }

  async shouldAttemptForwardMessage (): Promise<boolean> {
    // TODO
    // const estimatedTxCost = this.getEstimatedTxCostForForwardMessage()
    // const txOk = relayerReward > estimatedTxCost
    // const timeOk = now > bundleCommitTime + exitTime
    // const shouldAttempt = txOk && timeOk
    // return shouldAttempt
    return false
  }

  async attemptForwardMessage (): Promise<any> {
    // TODO
    // const tx = await contract.receiveOrForwardMessageBundle()
  }
}
