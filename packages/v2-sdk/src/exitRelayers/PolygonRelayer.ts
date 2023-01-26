import { providers } from 'ethers'

export class PolygonRelayer {
  network: string
  l1Provider: any
  l2Provider: any

  constructor (network: string = 'goerli', l1Provider: providers.Provider, l2Provider: providers.Provider) {
    this.network = network
    this.l1Provider = l1Provider
    this.l2Provider = l2Provider
  }

  async getExitPopulatedTx (l2TxHash: string): Promise<any> {
    return null
  }
}
