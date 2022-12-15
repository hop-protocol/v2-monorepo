import { Contract, providers } from 'ethers'
// import { Watcher } from '@eth-optimism/core-utils'
import { CrossChainMessenger, MessageStatus } from '@eth-optimism/sdk'

const contractAddresses: Record<string, any> = {
  // https://github.com/ethereum-optimism/optimism/tree/develop/packages/contracts/deployments/mainnet
  mainnet: {
    sccAddress: '0xBe5dAb4A2e9cd0F27300dB4aB94BeE3A233AEB19',
    l1MessengerAddress: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007'
  },
  // https://github.com/ethereum-optimism/optimism/tree/develop/packages/contracts/deployments/goerli#readme
  goerli: {
    sccAddress: '0x9c945aC97Baf48cB784AbBB61399beB71aF7A378',
    l1MessengerAddress: '0x5086d1eEF304eb5284A0f6720f79403b4e9bE294',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007'
  }
}

export class OptimismRelayer {
  network: string
  l1Provider: any
  l2Provider: any
  l1Messenger: Contract
  csm: CrossChainMessenger

  constructor (network: string = 'goerli', l1Provider: providers.Provider, l2Provider: providers.Provider) {
    this.network = network
    this.l1Provider = l1Provider
    this.l2Provider = l2Provider

    this.csm = new CrossChainMessenger({
      l1ChainId: 5,
      l2ChainId: 420,
      l1SignerOrProvider: l1Provider,
      l2SignerOrProvider: l2Provider
    })
  }

  async getExitPopulatedTx (l2TxHash: string) {
    const messageStatus = await this.csm.getMessageStatus(l2TxHash)

    if (messageStatus === MessageStatus.READY_FOR_RELAY) {
      console.log('ready for relay')
    } else {
      console.log('status', messageStatus)
      // throw new Error('not ready for relay')
    }

    const txData = await this.csm.populateTransaction.finalizeMessage(l2TxHash)
    return txData
  }
}
