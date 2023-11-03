import Erc20Abi from '@hop-protocol/v2-core/abi/static/ERC20.json'
import LiquidityHubAbi from '@hop-protocol/v2-core/abi/generated/LiquidityHub.json'
import wait from 'wait'
import { ChainController } from './ChainController'
import { Contract } from 'ethers'
import { GasPriceOracle } from '../gasPriceOracle'
import { chainIdToSlug } from '../utils/chainIdToSlug'
import { getSigner } from '../signer'
import { liquidityHubAddresses } from '../config'
import { pgDb } from '../pgDb'

export class Controller {
  chainControllers: Record<string, ChainController>
  gasPriceOracle = new GasPriceOracle('goerli')
  pgDb = pgDb

  constructor () {
    this.chainControllers = {
      ethereum: new ChainController('ethereum'),
      arbitrum: new ChainController('arbitrum'),
      optimism: new ChainController('optimism'),
      base: new ChainController('base')
    }
  }

  async startPoller () {
    while (true) {
      try {
        const events = await this.pgDb.events.TransferSent.getUnbondedTransfers()
        console.log('unbonded transfers sent events', events.length)
        for (const event of events) {
          await this.processTransferSentEvent(event)
        }
      } catch (err: any) {
        console.error(err)
      }
      await wait(10 * 1000)
    }
  }

  async processTransferSentEvent (transferSentEvent: any) {
    await this.bondTransfer(transferSentEvent)
  }

  async checkGasCost (event: any) {
    const targetGasCost = '0.0003' // TODO
    const toChainSlug = chainIdToSlug(event.toChainId)
    const timestamp = Math.floor(Date.now() / 1000) // event.blockTimestamp // TODO
    const gasLimit = event.gasLimit
    const txData = event.data
    const response = await this.gasPriceOracle.verifyGasCostEstimate(toChainSlug, timestamp, gasLimit, txData, targetGasCost)
    if (response?.data?.valid) {
      console.log('gas cost estimate is valid')
    } else {
      console.log('gas cost estimate is invalid')
    }
  }

  async bondTransfer (transferSentEvent: any) {
    const bondEvents = await this.pgDb.events.TransferBonded.getItems({
      claimId: transferSentEvent.claimId
    })

    if (bondEvents.length > 0) {
      throw new Error('transfer already bonded')
    }

    const fromChainId = transferSentEvent.context.chainId
    const tokenBusId = transferSentEvent.tokenBusId
    const liquidityHubFrom = this.getLiquidityHub(fromChainId)
    const tokenBusInfo = await liquidityHubFrom.getTokenBusInfo(tokenBusId)
    const { toChainId, toToken } = tokenBusInfo

    const liquidityHubTo = this.getLiquidityHub(toChainId)
    const to = transferSentEvent.to
    const amount = transferSentEvent.amount
    const minAmountOut = transferSentEvent.minAmountOut
    const sourceClaimsSent = transferSentEvent.sourceClaimsSent

    const toTokenContract = this.getTokenContract(toChainId, toToken)

    const bonderAddress = await this.getBonderAddress()
    const needsApproval = await toTokenContract.allowance(bonderAddress, liquidityHubTo.address)
    if (needsApproval.lt(amount)) {
      console.log('needs approval')
      const approvalTx = await toTokenContract.approve(liquidityHubTo.address, amount)
      await approvalTx.wait()
    }

    const bondTx = await liquidityHubTo.bond(tokenBusId, to, amount, minAmountOut, sourceClaimsSent)
    await bondTx.wait()

    return bondTx
  }

  // TODO
  async getQuote (input: any) {
    const { chainSlug } = input

    return {
      chainSlug
    }
  }

  getLiquidityHub (chainId: number) {
    const address = liquidityHubAddresses[chainIdToSlug(chainId)]
    const provider = this.getProviderWithSigner(chainId)
    const contract = new Contract(address, LiquidityHubAbi, provider)
    return contract
  }

  getTokenContract (chainId: number, tokenAddress: string) {
    const provider = this.getProviderWithSigner(chainId)
    const contract = new Contract(tokenAddress, Erc20Abi, provider)
    return contract
  }

  getProvider (chainId: number) {
    const provider = this.chainControllers[chainIdToSlug(chainId)].provider
    return provider
  }

  getProviderWithSigner (chainId: number) {
    const signer = getSigner()
    if (!signer) {
      throw new Error('no signer connected')
    }

    const provider = this.getProvider(chainId)
    return signer.connect(provider)
  }

  async getBonderAddress () {
    const signer = getSigner()
    if (!signer) {
      throw new Error('no signer connected')
    }

    return signer.getAddress()
  }
}
