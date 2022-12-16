import HubMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/HubMessageBridge.json'
import { BigNumber, ethers } from 'ethers'
import { Event } from './Event'
import { EventBase } from './types'
import { HubMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/HubMessageBridge__factory'

// event from HubMessageBridge
export interface BundleReceived extends EventBase {
  bundleId: string
  bundleRoot: string
  bundleFees: BigNumber
  fromChainId: number
  toChainId: number
  relayWindowStart: number
  relayer: string
}

export class BundleReceivedEventFetcher extends Event {
  eventName = 'BundleReceived'

  getFilter () {
    const hubMessageBridge = HubMessageBridge__factory.connect(this.address, this.provider)
    const filter = hubMessageBridge.filters.BundleReceived()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<BundleReceived[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): BundleReceived {
    const iface = new ethers.utils.Interface(HubMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const bundleId = decoded.args.bundleId.toString()
    const bundleRoot = decoded.args.bundleRoot.toString()
    const bundleFees = decoded.args.bundleFees
    const fromChainId = decoded.args.fromChainId.toNumber()
    const toChainId = decoded.args.toChainId.toNumber()
    const relayWindowStart = decoded.args.relayWindowStart.toNumber()
    const relayer = decoded.args.relayer.toString()

    return {
      _eventName: this.eventName,
      bundleId,
      bundleRoot,
      bundleFees,
      fromChainId,
      toChainId,
      relayWindowStart,
      relayer,
      _event: ethersEvent
    }
  }
}
