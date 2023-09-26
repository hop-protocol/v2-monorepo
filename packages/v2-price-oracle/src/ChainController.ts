import L2GasPriceOracleAbi from './abi/L2GasPriceOracle.json'
import { Contract, providers } from 'ethers'
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
    const feeData = {
      baseFeePerGas
    }
    return {
      timestamp,
      feeData
    }
  }

  async getBlockNumber () {
    return Number((await this.provider.getBlockNumber()).toString())
  }

  async getL1BaseFee (blockTag: string | number = 'latest') {
    if (this.chainSlug === 'ethereum') {
      throw new Error(`${this.chainSlug} does not support L1 base fee`)
    } else if (this.chainSlug === 'optimism' || this.chainSlug === 'base') {
      const l2GasPriceOracle = '0x420000000000000000000000000000000000000F'
      const contract = new Contract(l2GasPriceOracle, L2GasPriceOracleAbi, this.provider)
      const l1BaseFee = await contract.l1BaseFee({
        blockTag
      })
      return l1BaseFee
    } else if (this.chainSlug === 'arbitrum') {
      throw new Error(`${this.chainSlug} not implemented yet`)
    }
  }
}
