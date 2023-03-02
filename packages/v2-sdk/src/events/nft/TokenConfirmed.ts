import ERC721BridgeAbi from '@hop-protocol/v2-core/abi/generated/ERC721Bridge.json'
import { ERC721Bridge__factory } from '@hop-protocol/v2-core/contracts/factories/generated/ERC721Bridge__factory'
import { Event } from '../Event'
import { EventBase } from '../types'
import { ethers } from 'ethers'

// event from ERC721Bridge
export interface TokenConfirmed extends EventBase {
  tokenId: string
}

export class TokenConfirmedEventFetcher extends Event {
  eventName = 'TokenConfirmed'

  getFilter () {
    const nftBridge = ERC721Bridge__factory.connect(this.address, this.provider)
    const filter = nftBridge.filters.TokenSent()
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<TokenConfirmed[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): TokenConfirmed {
    const iface = new ethers.utils.Interface(ERC721BridgeAbi)
    const decoded = iface.parseLog(ethersEvent)

    const tokenId = decoded.args.tokenId.toString()

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      tokenId
    }
  }
}
