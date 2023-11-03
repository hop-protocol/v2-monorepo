import LiquidityHubAbi from '@hop-protocol/v2-core/abi/generated/LiquidityHub.json'
import { BigNumber, ethers } from 'ethers'
import { Event } from '../Event'
import { EventBase } from '../types'
import { LiquidityHub__factory } from '@hop-protocol/v2-core/contracts/factories/generated/LiquidityHub__factory'

// event from LiquidityHub
export interface TransferSent extends EventBase {
  claimId: string
  tokenBusId: string
  to: string
  amount: BigNumber
  minAmountOut: BigNumber
  sourceClaimsSent: BigNumber
  bonus: BigNumber
}

export class TransferSentEventFetcher extends Event {
  eventName = 'TransferSent'

  getFilter () {
    const liquidityHub = LiquidityHub__factory.connect(this.address, this.provider)
    const filter = liquidityHub.filters.TransferSent()
    return filter
  }

  getClaimIdFilter (claimId: string) {
    const liquidityHub = LiquidityHub__factory.connect(this.address, this.provider)
    const filter = liquidityHub.filters.TransferSent(claimId)
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<TransferSent[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): TransferSent {
    const iface = new ethers.utils.Interface(LiquidityHubAbi)
    const decoded = iface.parseLog(ethersEvent)

    const claimId = decoded.args.claimId.toString()
    const tokenBusId = decoded.args.tokenBusId.toString()
    const to = decoded.args.to
    const amount = decoded.args.amount
    const minAmountOut = decoded.args.minAmountOut
    const sourceClaimsSent = decoded.args.sourceClaimsSent
    const bonus = decoded.args.bonus

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      claimId,
      tokenBusId,
      to,
      amount,
      minAmountOut,
      sourceClaimsSent,
      bonus
    }
  }
}
