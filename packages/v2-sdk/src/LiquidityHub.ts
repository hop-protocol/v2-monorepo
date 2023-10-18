import LiquidityHubAbi from '@hop-protocol/v2-core/abi/generated/LiquidityHub.json'
import { providers, Contract, Signer } from 'ethers'

// Constructor input type
interface LiquidityHubConstructorInput {
  provider?: providers.Provider
  signer?: Signer
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
  window: number
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

export class LiquidityHub {
  provider: providers.Provider
  signer: Signer

  constructor (input: LiquidityHubConstructorInput = {}) {
    const { provider, signer } = input
    this.provider = provider
    this.signer = signer
    if (!this.provider && this.signer) {
      this.provider = this.signer.provider
    }
  }

  connect (signer: Signer) {
    return new LiquidityHub({ provider: this.provider, signer })
  }

  async getTransferSentEvents (input: TransferEventInput) {
    const { startBlock, endBlock } = input
    // event TransferSent(
    //     bytes32 indexed claimId,
    //     bytes32 indexed tokenBusId,
    //     address indexed to,
    //     uint256 amount,
    //     uint256 minAmountOut,
    //     uint256 sourceClaimsSent,
    //     uint256 bonus
    // );

    const address = ''
    const contract = new Contract(address, LiquidityHubAbi, this.provider)
    const filter = contract.filters.TransferSent()
    const events = await contract.queryFilter(filter, startBlock, endBlock)
    return events
  }

  async getTransferBondedEvents (input: TransferEventInput) {
    const { startBlock, endBlock } = input
    // event TransferBonded(
    //     bytes32 indexed claimId,
    //     bytes32 indexed tokenBusId,
    //     address indexed to,
    //     uint256 amount,
    //     uint256 minAmountOut,
    //     uint256 sourceClaimsSent,
    //     uint256 fee
    // );

    const address = ''
    const contract = new Contract(address, LiquidityHubAbi, this.provider)
    const filter = contract.filters.TransferBonded()
    const events = await contract.queryFilter(filter, startBlock, endBlock)
    return events
  }

  getLiquidityHubContract (): Contract {
    const address = ''
    const contract = new Contract(address, LiquidityHubAbi, this.signer || this.provider)
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
    const { tokenBusId, recipient, window } = input
    const contract = this.getLiquidityHubContract()
    return contract.withdrawClaims(tokenBusId, recipient, window)
  }

  async getWithdrawableBalance (input: WithdrawBalanceInput) {
    const { tokenBusId, recipient, window } = input
    const contract = this.getLiquidityHubContract()
    return contract.getWithdrawableBalance(tokenBusId, recipient, window)
  }

  async getClaimId (input: SendBondPostClaimInput) {
    const { tokenBusId, to, amount, minAmountOut, sourceClaimsSent } = input
    const contract = this.getLiquidityHubContract()
    return contract.getClaimId(tokenBusId, to, amount, minAmountOut, sourceClaimsSent)
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

  async getTokenBusInfo (input: GetTokenBusInfoInput) {
    const { tokenBusId } = input
    const contract = this.getLiquidityHubContract()
    return contract.getTokenBusInfo(tokenBusId)
  }
}
