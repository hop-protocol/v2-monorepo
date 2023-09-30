import SpokeMessageBridgeAbi from '@hop-protocol/v2-core/abi/generated/SpokeMessageBridge.json'
import { Contract, providers } from 'ethers'
import { bridgeAddresses } from './config'
import { getRpcProvider } from './utils/getRpcProvider'

export class ChainController {
  provider: providers.Provider
  chainSlug: string

  constructor (chainSlug: string) {
    this.chainSlug = chainSlug
    this.provider = getRpcProvider(chainSlug)
  }

  async getMessageSentEvents (blockTag: string | number = 'latest'): Promise<any> {
    const address = bridgeAddresses[this.chainSlug]
    const contract = new Contract(address, SpokeMessageBridgeAbi, this.provider)
    const filter = contract.filters.MessageSent()
    const events = await contract.queryFilter(filter, blockTag)

    return events
  }

  async getBlockNumber () {
    return Number((await this.provider.getBlockNumber()).toString())
  }
}
