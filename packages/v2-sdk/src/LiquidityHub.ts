import { Contract, Signer, ethers, providers } from 'ethers'
import { ERC20__factory } from '@hop-protocol/v2-core/contracts/factories/static/ERC20__factory'
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

interface StakeHopInput {
  role: string;
  staker?: string; // Ethereum address format
  amount: ethers.BigNumberish; // Can be a number, string, BigNumber, etc.
}

interface UnstakeHopInput {
  role: string;
  amount: ethers.BigNumberish; // Can be a number, string, BigNumber, etc.
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

  async getHopBalance (address?: string) {
    if (!address) {
      address = await this.getSignerAddress()
    }
    if (!address) {
      throw new Error('Address not set')
    }
    const contract = await this.getHopTokenContract()
    return contract.balanceOf(address)
  }

  async getHopTokenContract () {
    const hopTokenAddress = await this.getHopTokenAddress()
    const contract = ERC20__factory.connect(hopTokenAddress, this.provider)
    return contract
  }

  async stakeHop (input: StakeHopInput) {
    let { role, staker, amount } = input
    if (!staker) {
      staker = await this.getSignerAddress()
    }
    if (!staker) {
      throw new Error('Staker address not set')
    }
    const minRequired = await this.getMinHopStakeForRole({ role })
    const balance = await this.getHopBalance(staker)

    if (balance.lt(amount)) {
      throw new Error(`Insufficient balance to stake ${amount.toString()} HOP`)
    }

    const hopTokenContract = await this.getHopTokenContract()
    if (balance.lt(minRequired)) {
      const approvalTx = await hopTokenContract.approve(this.address, minRequired)
      await approvalTx.wait()
    }

    return this._stakeHop({ role, staker, amount })
  }

  async unstakeHop (input: UnstakeHopInput) {
    const { role, amount } = input
    const staker = await this.getSignerAddress()
    const balance = await this.getWithdrawableStakeBalance({ role, staker })

    if (balance.lt(amount)) {
      throw new Error('Insufficient balance to unstake')
    }

    const unstakeTx = await this._unstakeHop({ role, amount })
    await unstakeTx.wait()
    return this.withdraw({ role, staker })
  }

  async getSignerAddress () {
    if (this.signer) {
      return this.signer.getAddress()
    }
  }
}
