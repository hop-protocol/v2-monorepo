import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { BigNumber, ethers } from 'ethers'
import { Event } from './Event'
import { EventBase } from './types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'

// event from SpokeMessageBridge
export interface BundleCommitted extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  toChainId: number
  commitTime: number
}

export class BundleCommittedEventFetcher extends Event {
  eventName = 'BundleCommitted'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.BundleCommitted()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<BundleCommitted[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): BundleCommitted {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const bundleId = decoded.args.bundleId.toString()
    const bundleRoot = decoded.args.bundleRoot.toString()
    const bundleFees = decoded.args.bundleFees
    const toChainId = decoded.args.toChainId.toNumber()
    const commitTime = decoded.args.commitTime.toNumber()

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      bundleId,
      bundleRoot,
      bundleFees,
      toChainId,
      commitTime,
    }
  }
}
