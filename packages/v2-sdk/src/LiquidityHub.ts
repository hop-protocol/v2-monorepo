import { Contract, Signer, providers } from 'ethers'
import { LiquidityHub__factory } from '@hop-protocol/v2-core/contracts/factories/generated/LiquidityHub__factory'
import { StakingRegistry } from './StakingRegistry'

// Constructor input type
interface LiquidityHubConstructorInput {
  provider?: providers.Provider
  signer?: Signer
  address?: string
}

// getTransferSentEvents and getTransferBondedEvents input type
interface TransferEventInput {
  startBlock: number
  endBlock: number
}

// send, bond, postClaim, and getClaimId input type
interface SendBondPostClaimInput {
  tokenBusId: string
  to: string
  amount: number
  minAmountOut: number
  sourceClaimsSent?: number
}

// bond input type
interface BondInput {
  tokenBusId: string
  to: string
  amount: number
  minAmountOut: number
  sourceClaimsSent: number
}

// withdrawClaims and getWithdrawableBalance input type
interface WithdrawBalanceInput {
  tokenBusId: string
  recipient: string
  timeWindow: number
}

// getTokenBusId input type
interface GetTokenBusIdInput {
  chainId0: number
  token0: string
  chainId1: number
  token1: string
}

// getFee input type
interface GetFeeInput {
  chainIds: number[]
}

// getTokenBusInfo input type
interface GetTokenBusInfoInput {
  tokenBusId: string
}

export class LiquidityHub extends StakingRegistry {
  provider: providers.Provider
  signer: Signer
  address : string

  constructor (input: LiquidityHubConstructorInput = {}) {
    const { provider, signer, address } = input
    super({
      provider,
      signer,
      address
    })
    this.provider = provider
    this.signer = signer
    if (!this.provider && this.signer) {
      this.provider = this.signer.provider
    }
    this.address = address
  }

  connect (signer: Signer) {
    return new LiquidityHub({ provider: this.provider, signer })
  }

  async getTransferSentEvents (input: TransferEventInput) {
    const { startBlock, endBlock } = input
    const contract = this.getLiquidityHubContract()
    const filter = contract.filters.TransferSent()
    const events = await contract.queryFilter(filter, startBlock, endBlock)
    return events
  }

  async getTransferBondedEvents (input: TransferEventInput) {
    const { startBlock, endBlock } = input
    const contract = this.getLiquidityHubContract()
    const filter = contract.filters.TransferBonded()
    const events = await contract.queryFilter(filter, startBlock, endBlock)
    return events
  }

  getLiquidityHubContract (): Contract {
    if (!this.address) {
      throw new Error('LiquidityHub address not set')
    }
    const contract = LiquidityHub__factory.connect(this.address, this.signer || this.provider)
    return contract
  }

  async send (input: SendBondPostClaimInput) {
    const { tokenBusId, to, amount, minAmountOut } = input
    const contract = this.getLiquidityHubContract()
    const value = 0
    return contract.send(tokenBusId, to, amount, minAmountOut, {
      value
    })
  }

  async bond (input: BondInput) {
    const { tokenBusId, to, amount, minAmountOut, sourceClaimsSent } = input
    const contract = this.getLiquidityHubContract()
    return contract.bond(tokenBusId, to, amount, minAmountOut, sourceClaimsSent)
  }

  async postClaim (input: SendBondPostClaimInput) {
    const { tokenBusId, to, amount, minAmountOut, sourceClaimsSent } = input
    const contract = this.getLiquidityHubContract()
    return contract.postClaim(tokenBusId, to, amount, minAmountOut, sourceClaimsSent)
  }

  async withdrawClaims (input: WithdrawBalanceInput) {
    const { tokenBusId, recipient, timeWindow } = input
    const contract = this.getLiquidityHubContract()
    return contract.withdrawClaims(tokenBusId, recipient, timeWindow)
  }

  async getWithdrawableBalance (input: WithdrawBalanceInput) {
    const { tokenBusId, recipient, timeWindow } = input
    const contract = this.getLiquidityHubContract()
    return contract.getWithdrawableBalance(tokenBusId, recipient, timeWindow)
  }

  async getClaimId (input: SendBondPostClaimInput) {
    const { tokenBusId, to, amount, minAmountOut, sourceClaimsSent } = input
    const contract = this.getLiquidityHubContract()
    return contract.getClaimId(tokenBusId, to, amount, minAmountOut, sourceClaimsSent)
  }

  async replaceClaim () {
    const contract = this.getLiquidityHubContract()
    return contract.replaceClaim() // TODO
  }

  async confirmClaim (claimId: string) {
    const contract = this.getLiquidityHubContract()
    return contract.confirmClaim(claimId) // TODO
  }

  async getTokenBusId (input: GetTokenBusIdInput) {
    const { chainId0, token0, chainId1, token1 } = input
    const contract = this.getLiquidityHubContract()
    return contract.getTokenBusId(chainId0, token0, chainId1, token1)
  }

  async getFee (input: GetFeeInput) {
    const { chainIds } = input
    const contract = this.getLiquidityHubContract()
    return contract.getFee(chainIds)
  }

  async getHopTokenAddress () {
    const contract = this.getLiquidityHubContract()
    return contract.hopToken()
  }

  async getMinBonderStake () {
    const contract = this.getLiquidityHubContract()
    return contract.minBonderStake()
  }

  async getTokenBusInfo (input: GetTokenBusInfoInput) {
    const { tokenBusId } = input
    const contract = this.getLiquidityHubContract()
    return contract.getTokenBusInfo(tokenBusId)
  }
}
