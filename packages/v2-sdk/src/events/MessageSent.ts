import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Event } from './Event'
import { EventBase } from './types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'
import { ethers } from 'ethers'

// event from SpokeMessageBridge (ICrossChainSource)
export interface MessageSent extends EventBase {
  messageId: string
  from: string
  toChainId: number
  to: string
  data: string
}

export class MessageSentEventFetcher extends Event {
  eventName = 'MessageSent'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageSent()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<MessageSent[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): MessageSent {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const messageId = decoded.args.messageId.toString()
    const from = decoded.args.from
    const toChainId = decoded.args.toChainId.toNumber()
    const to = decoded.args.to
    const data = decoded.args.data

    return {
      _eventName: this.eventName,
      messageId,
      from,
      toChainId,
      to,
      data,
      _event: ethersEvent
    }
  }
}
