import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { BigNumber, ethers } from 'ethers'
import { Event } from './Event'
import { EventBase } from './types'
import { SpokeMessageBridge__factory } from '@hop-protocol/v2-core/contracts/factories/SpokeMessageBridge__factory'

// event from SpokeMessageBridge
export interface FeesSentToHub extends EventBase {
  amount: BigNumber
}

export class FeesSentToHubEventFetcher extends Event {
  eventName = 'FeesSentToHub'

  getFilter () {
    const spokeMessageBridge = SpokeMessageBridge__factory.connect(this.address, this.provider)
    const filter = spokeMessageBridge.filters.FeesSentToHub()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<FeesSentToHub[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): FeesSentToHub {
    const iface = new ethers.utils.Interface(SpokeMessageBridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const amount = decoded.args.amount

    return {
      _eventName: this.eventName,
      amount,
      _event: ethersEvent
    }
  }
}
