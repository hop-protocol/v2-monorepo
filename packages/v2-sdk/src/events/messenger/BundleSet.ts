import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Event } from '../Event'
import { EventBase } from '../types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/SpokeMessageBridge__factory'
import { ethers } from 'ethers'

// event from SpokeMessageBridge
export interface BundleSet extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
}

export class BundleSetEventFetcher extends Event {
  eventName = 'BundleSet'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.BundleSet()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<BundleSet[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): BundleSet {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const bundleId = decoded.args.bundleId.toString()
    const bundleRoot = decoded.args.bundleRoot.toString()
    const fromChainId = Number(decoded.args.fromChainId.toString())

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      bundleId,
      bundleRoot,
      fromChainId
    }
  }
}
