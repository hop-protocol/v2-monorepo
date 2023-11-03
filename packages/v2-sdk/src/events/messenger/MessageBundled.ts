import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Event } from '../Event'
import { EventBase } from '../types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/SpokeMessageBridge__factory'
import { ethers } from 'ethers'

// event from SpokeMessageBridge
export interface MessageBundled extends EventBase {
  bundleId: string
  treeIndex: number
  messageId: string
}

export class MessageBundledEventFetcher extends Event {
  eventName = 'MessageBundled'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageBundled()
    return filter
  }

  getBundleIdFilter (bundleId: string) {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageBundled(bundleId)
    return filter
  }

  getMessageIdFilter (messageId: string) {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageBundled(null, null, messageId)
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<MessageBundled[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): MessageBundled {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const bundleId = decoded.args.bundleId.toString()
    const treeIndex = Number(decoded.args.treeIndex.toString())
    const messageId = decoded.args.messageId.toString()

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      bundleId,
      treeIndex,
      messageId
    }
  }
}
