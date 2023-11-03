import LiquidityHubAbi from '@hop-protocol/v2-core/abi/generated/LiquidityHub.json'
import { BigNumber, ethers } from 'ethers'
import { Event } from '../Event'
import { EventBase } from '../types'
import { LiquidityHub__factory } from '@hop-protocol/v2-core/contracts/factories/generated/LiquidityHub__factory'

// event from LiquidityHub
export interface TransferBonded extends EventBase {
  claimId: string
  tokenBusId: string
  to: string
  amount: BigNumber
  minAmountOut: BigNumber
  sourceClaimsSent: BigNumber
  fee: BigNumber
}

export class TransferBondedEventFetcher extends Event {
  eventName = 'TransferBonded'

  getFilter () {
    const liquidityHub = LiquidityHub__factory.connect(this.address, this.provider)
    const filter = liquidityHub.filters.TransferBonded()
    return filter
  }

  getClaimIdFilter (claimId: string) {
    const liquidityHub = LiquidityHub__factory.connect(this.address, this.provider)
    const filter = liquidityHub.filters.TransferBonded(claimId)
    return filter
  }

  async getEvents (startBlock: number, endBlock: number): Promise<TransferBonded[]> {
    const filter = this.getFilter()
    return this._getEvents(filter, startBlock, endBlock)
  }

  toTypedEvent (ethersEvent: any): TransferBonded {
    const iface = new ethers.utils.Interface(LiquidityHubAbi)
    const decoded = iface.parseLog(ethersEvent)

    const claimId = decoded.args.claimId.toString()
    const tokenBusId = decoded.args.tokenBusId.toString()
    const to = decoded.args.to
    const amount = decoded.args.amount
    const minAmountOut = decoded.args.minAmountOut
    const sourceClaimsSent = decoded.args.sourceClaimsSent
    const fee = decoded.args.fee

    return {
      eventName: this.eventName,
      eventLog: ethersEvent,
      claimId,
      tokenBusId,
      to,
      amount,
      minAmountOut,
      sourceClaimsSent,
      fee
    }
  }
}
