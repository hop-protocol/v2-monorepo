import L2ArbGasInfoAbi from './abi/L2ArbGasInfo.json'
import L2ArbNodeInterface from './abi/L2ArbNodeInterface.json'
import L2OpGasPriceOracleAbi from './abi/L2OpGasPriceOracle.json'
import { Contract, constants, providers } from 'ethers'
import { getRpcProvider } from './utils/getRpcProvider'

export class ChainController {
  provider: providers.Provider
  chainSlug: string

  constructor (chainSlug: string) {
    this.chainSlug = chainSlug
    this.provider = getRpcProvider(chainSlug)
  }

  async getFeeData (blockTag: number | string = 'latest') {
    const block = await this.provider.getBlock(blockTag)
    const timestamp = block.timestamp
    const baseFeePerGas = block?.baseFeePerGas?.toString()
    if (!baseFeePerGas) {
      throw new Error('baseFeePerGas not found')
    }
    const l1BaseFee = await this.getL1BaseFee(blockTag)
    const feeData = {
      baseFeePerGas,
      l1BaseFee: l1BaseFee?.toString()
    }
    return {
      timestamp,
      feeData
    }
  }

  async getBlockNumber () {
    return Number((await this.provider.getBlockNumber()).toString())
  }

  async getL1BaseFee (blockTag: string | number = 'latest'): Promise<any> {
    if (this.chainSlug === 'optimism' || this.chainSlug === 'base') {
      const l2GasPriceOracle = '0x420000000000000000000000000000000000000F'
      const contract = new Contract(l2GasPriceOracle, L2OpGasPriceOracleAbi, this.provider)
      const l1BaseFee = await contract.l1BaseFee({
        blockTag
      })
      return l1BaseFee
    } else if (this.chainSlug === 'arbitrum') {
      const l2ArbGasInfo = '0x000000000000000000000000000000000000006C'
      const contract = new Contract(l2ArbGasInfo, L2ArbGasInfoAbi, this.provider)
      const l1BaseFee = await contract.getL1BaseFeeEstimate({
        blockTag
      })
      return l1BaseFee
    }
  }

  async getArbPricesInWei (blockTag: string | number = 'latest'): Promise<any> {
    const l2ArbGasInfo = '0x000000000000000000000000000000000000006C'
    const contract = new Contract(l2ArbGasInfo, L2ArbGasInfoAbi, this.provider)
    const l1BaseFee = await contract.getPricesInWei({
      blockTag: 'latest'
    })
    return l1BaseFee
  }

  async getArbEstimateComponents (input: any): Promise<any> {
    const { from, destinationAddress = constants.AddressZero, txData, blockNumber = 'latest' } = input
    const nodeInterface = '0x00000000000000000000000000000000000000C8'
    const contract = new Contract(nodeInterface, L2ArbNodeInterface, this.provider)
    const contractCreation = false
    const args = [
      destinationAddress,
      contractCreation,
      txData,
      {
        blockTag: blockNumber,
        from
      }
    ]
    // console.log('args', args)
    const data = await contract.callStatic.gasEstimateComponents(...args)

    // console.log(
    //   'gasEstimate', data.gasEstimate.toString(),
    //   'gasEstimateForL1', data.gasEstimateForL1.toString(),
    //   'baseFee', data.baseFee.toString(),
    //   'l1BaseFeeEstimate', data.l1BaseFeeEstimate.toString(),
    // )

    // gasEstimate 21272  gasEstimateForL1 0      baseFee 100000000 l1BaseFeeEstimate 0
    // gasEstimate 180521 gasEstimateForL1 159249 baseFee 100000000 l1BaseFeeEstimate 5179678243

    return data
  }
}
