import { getRpcProvider } from './utils/getRpcProvider'
import { providers } from 'ethers'

export class ChainController {
  provider: providers.Provider

  constructor (chainSlug: string) {
    this.provider = getRpcProvider(chainSlug)
  }

  async getCurrentFeeData () {
    const block = await this.provider.getBlock('latest')
    const timestamp = block.timestamp
    const baseFeePerGas = block?.baseFeePerGas?.toString()
    const feeData = {
      baseFeePerGas
    }
    return {
      timestamp,
      feeData
    }
  }
}
