import HubMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/HubMessageBridge.json'
import { Event } from '../Event'
import { EventBase } from '../types'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/HubMessageBridge__factory'
import { ethers } from 'ethers'

// event from HubMessageBridge
export interface BundleForwarded extends EventBase {
  bundleId: string
  bundleRoot: string
  fromChainId: number
  toChainId: number
}

export class BundleForwardedEventFetcher extends Event {
  eventName = 'BundleForwarded'

  getFilter () {
    const hubMessageBridge = HubMessageBridge__factory.connect(this.address, this.provider)
    const filter = hubMessageBridge.filters.BundleForwarded()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<BundleForwarded[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): BundleForwarded {
    const iface = new ethers.utils.Interface(HubMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const bundleId = decoded.args.bundleId.toString()
    const bundleRoot = decoded.args.bundleRoot.toString()
    const fromChainId = Number(decoded.args.fromChainId.toString())
    const toChainId = Number(decoded.args.toChainId.toString())

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      bundleId,
      bundleRoot,
      fromChainId,
      toChainId
    }
  }
}
