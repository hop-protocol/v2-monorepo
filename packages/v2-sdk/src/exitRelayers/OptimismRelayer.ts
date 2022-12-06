import { Contract, providers } from 'ethers'
import { Watcher } from '@eth-optimism/core-utils'
import { getContractFactory, predeploys } from '@eth-optimism/contracts'
import { getMessagesAndProofsForL2Transaction } from '@eth-optimism/message-relayer'

const contractAddresses: Record<string, any> = {
  mainnet: {
    sccAddress: '0xBe5dAb4A2e9cd0F27300dB4aB94BeE3A233AEB19',
    l1MessengerAddress: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007'
  },
  goerli: {
    sccAddress: '0xBe5dAb4A2e9cd0F27300dB4aB94BeE3A233AEB19',
    l1MessengerAddress: '0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007'
  }
}

export class OptimismRelayer {
  network: string
  l1Provider: any
  l2Provider: any
  l1Messenger: Contract
  scc: Contract
  watcher: Watcher

  constructor (network: string = 'goerli', l1Provider: providers.Provider, l2Provider: providers.Provider) {
    this.network = network
    this.l1Provider = l1Provider
    this.l2Provider = l2Provider
    const sccAddress = contractAddresses[this.network].sccAddress
    const l1MessengerAddress = contractAddresses[this.network].l1MessengerAddress
    const l2MessengerAddress = contractAddresses[this.network].l2MessengerAddress

    this.watcher = new Watcher({
      l1: {
        provider: this.l1Provider,
        messengerAddress: l1MessengerAddress
      },
      l2: {
        provider: this.l2Provider,
        messengerAddress: l2MessengerAddress
      }
    })

    this.l1Messenger = getContractFactory('IL1CrossDomainMessenger')
      .attach(this.watcher.l1.messengerAddress)
    this.scc = getContractFactory('IStateCommitmentChain')
      .attach(sccAddress)
  }

  async getExitPopulatedTx (l2TxHash: string) {
    const messagePairs = await getMessagesAndProofsForL2Transaction(
      this.l1Provider,
      this.l2Provider,
      this.scc.address,
      predeploys.L2CrossDomainMessenger,
      l2TxHash
    )

    if (!messagePairs) {
      throw new Error('messagePairs not found')
    }

    const { message, proof } = messagePairs[0]
    const inChallengeWindow = await this.scc.insideFraudProofWindow(proof.stateRootBatchHeader)
    if (inChallengeWindow) {
      throw new Error('exit within challenge window')
    }

    return this.l1Messenger
      .populateTransaction
      .relayMessage(
        message.target,
        message.sender,
        message.message,
        message.messageNonce,
        proof
      ).catch(err => this.formatError(err))
  }

  formatError (err: Error) {
    const isNotCheckpointedYet = err.message.includes('unable to find state root batch for tx')
    const isProofNotFound = err.message.includes('messagePairs not found')
    const isInsideFraudProofWindow = err.message.includes('exit within challenge window')
    const notReadyForExit = isNotCheckpointedYet || isProofNotFound || isInsideFraudProofWindow
    if (notReadyForExit) {
      throw new Error('too early to exit')
    }
    const isAlreadyRelayed = err.message.includes('message has already been received')
    if (isAlreadyRelayed) {
      throw new Error('message has already been relayed')
    }
    // isEventLow() does not handle the case where `batchEvents` is null
    // https://github.com/ethereum-optimism/optimism/blob/26b39199bef0bea62a2ff070cd66fd92918a556f/packages/message-relayer/src/relay-tx.ts#L179
    const cannotReadProperty = err.message.includes('Cannot read property')
    if (cannotReadProperty) {
      throw new Error('event not found in optimism sdk')
    }
    throw err
  }
}
