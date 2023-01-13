import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Event } from './Event'
import { EventBase } from './types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { ethers } from 'ethers'

// event from SpokeMessageBridge (ICrossChainDestination)
export interface MessageReverted extends EventBase {
  messageId: string
  fromChainId: number
  from: string
  to: string
}

export class MessageRevertedEventFetcher extends Event {
  eventName = 'MessageReverted'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageReverted()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<MessageReverted[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): MessageReverted {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const messageId = decoded.args.messageId.toString()
    const fromChainId = Number(decoded.args.fromChainId.toString())
    const from = decoded.args.from
    const to = decoded.args.to

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      messageId,
      fromChainId,
      from,
      to
    }
  }
}
