import { providers } from 'ethers'
import { getRpcProvider } from './utils/getRpcProvider'

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
      baseFeePerGas,
    }
    return {
      timestamp,
      feeData
    }
  }
}
