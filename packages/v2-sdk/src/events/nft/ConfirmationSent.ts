import ERC721BridgeAbi from '@hop-protocol/v2-core/abi/generated/ERC721Bridge.json'
import { ERC721Bridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/ERC721Bridge__factory'
import { Event } from '../Event'
import { EventBase } from '../types'
import { ethers } from 'ethers'

// event from ERC721Bridge
export interface ConfirmationSent extends EventBase {
  tokenId: string
  toChainId: number
}

export class ConfirmationSentEventFetcher extends Event {
  eventName = 'ConfirmationSent'

  getFilter () {
    const nftBridge = ERC721Bridge__factory.connect(this.address, this.provider)
    const filter = nftBridge.filters.TokenSent()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<ConfirmationSent[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): ConfirmationSent {
    const iface = new ethers.utils.Interface(ERC721BridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const tokenId = decoded.args.tokenId.toString()
    const toChainId = Number(decoded.args.toChainId.toString())

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      tokenId,
      toChainId
    }
  }
}
