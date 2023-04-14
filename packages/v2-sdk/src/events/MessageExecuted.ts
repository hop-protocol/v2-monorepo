import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Event } from './Event'
import { EventBase } from './types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/SpokeMessageBridge__factory'
import { ethers } from 'ethers'

// event from SpokeMessageBridge (MessageExecutor.sol)
export interface MessageExecuted extends EventBase {
  messageId: string
  fromChainId: number
}

export class MessageExecutedEventFetcher extends Event {
  eventName = 'MessageExecuted'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.MessageExecuted()
    return filter
  }

  getMessageIdFilter (messageId: string) {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    // TODO: after it's indexed in contract
    // const filter = spokeMessageBridge.filters.MessageExecuted(messageId)
    const filter = spokeMessageBridge.filters.MessageExecuted()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<MessageExecuted[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): MessageExecuted {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const messageId = decoded.args.messageId.toString()
    const fromChainId = Number(decoded.args.fromChainId.toString())

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      messageId,
      fromChainId
    }
  }
}
