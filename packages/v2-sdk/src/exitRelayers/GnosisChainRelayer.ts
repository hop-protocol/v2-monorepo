import l1xDaiAmbAbi from '@hop-protocol/core/abi/static/L1_xDaiAMB.json'
import l2xDaiAmbAbi from '@hop-protocol/core/abi/static/L2_xDaiAMB.json'
import { Contract, providers } from 'ethers'
import { L1_xDaiAMB, L2_xDaiAMB } from '@hop-protocol/core/contracts'
import { solidityKeccak256 } from 'ethers/lib/utils'

// reference:
// https://github.com/poanetwork/tokenbridge/blob/bbc68f9fa2c8d4fff5d2c464eb99cea5216b7a0f/oracle/src/events/processAMBCollectedSignatures/index.js#L149
export class GnosisChainRelayer {
  network: string
  l1Provider: any
  l2Provider: any
  l1AmbAddress: string
  l2AmbAddress: string

  constructor (network: string = 'goerli', l1Provider: providers.Provider, l2Provider: providers.Provider) {
    // TODO: set this addresses
    if (network === 'mainnet') {
      this.l1AmbAddress = ''
      this.l2AmbAddress = ''
    } else {
      this.l1AmbAddress = ''
      this.l2AmbAddress = ''
    }
    this.network = network
    this.l1Provider = l1Provider
    this.l2Provider = l2Provider
  }

  getL1Amb () {
    return new Contract(this.l1AmbAddress, l1xDaiAmbAbi, this.l1Provider) as L1_xDaiAMB
  }

  getL2Amb () {
    return new Contract(this.l2AmbAddress, l2xDaiAmbAbi, this.l2Provider) as L2_xDaiAMB
  }

  async getExitPopulatedTx (l2TxHash: string): Promise<any> {
    const l1Amb = this.getL1Amb()
    const l2Amb = this.getL2Amb()

    const sigEvent = await this.getValidSigEvent(l2TxHash)
    if (!sigEvent?.args) {
      throw new Error(`args for sigEvent not found for ${l2TxHash}`)
    }

    const message = sigEvent.args.encodedData
    if (!message) {
      throw new Error(`message not found for ${l2TxHash}`)
    }

    const msgHash = solidityKeccak256(['bytes'], [message])
    const id = await l2Amb.numMessagesSigned(msgHash)
    const alreadyProcessed = await l2Amb.isAlreadyProcessed(id)
    if (!alreadyProcessed) {
      throw new Error(`commit already processed found for ${l2TxHash}`)
    }

    const messageId =
      '0x' +
      Buffer.from(strip0x(message), 'hex')
        .slice(0, 32)
        .toString('hex')
    const alreadyRelayed = await l1Amb.relayedMessages(messageId)
    if (alreadyRelayed) {
      throw new Error(`message already relayed for ${l2TxHash}`)
    }

    const requiredSigs = (await l2Amb.requiredSignatures()).toNumber()
    const sigs: any[] = []
    for (let i = 0; i < requiredSigs; i++) {
      const sig = await l2Amb.signature(msgHash, i)
      const [v, r, s]: any[] = [[], [], []]
      const vrs = signatureToVRS(sig)
      v.push(vrs.v)
      r.push(vrs.r)
      s.push(vrs.s)
      sigs.push(vrs)
    }
    const packedSigs = packSignatures(sigs)

    return l1Amb.executeSignatures(message, packedSigs)
  }

  async getValidSigEvent (l2TxHash: string) {
    const tx = await this.l2Provider.getTransactionReceipt(l2TxHash)
    const l2Amb = this.getL2Amb()
    const sigEvents = await l2Amb.queryFilter(
      l2Amb.filters.UserRequestForSignature(),
      tx.blockNumber,
      tx.blockNumber
    )

    for (const sigEvent of sigEvents) {
      const sigTxHash = sigEvent.transactionHash
      if (sigTxHash.toLowerCase() !== l2TxHash.toLowerCase()) {
        continue
      }
      const { encodedData } = sigEvent.args
      // TODO: better way of slicing by method id
      const data = encodedData.includes('ef6ebe5e00000')
        ? encodedData.replace(/.*(ef6ebe5e00000.*)/, '$1')
        : ''
      if (data) {
        return sigEvent
      }
    }
  }
}

// https://github.com/poanetwork/tokenbridge/blob/bbc68f9fa2c8d4fff5d2c464eb99cea5216b7a0f/oracle/src/utils/message.js
const assert = require('assert') // eslint-disable-line @typescript-eslint/no-var-requires
const { toHex } = require('web3-utils') // eslint-disable-line @typescript-eslint/no-var-requires

const strip0x = (value: string) => value.replace(/^0x/i, '')

function signatureToVRS (rawSignature: any) {
  const signature = strip0x(rawSignature)
  assert.strictEqual(signature.length, 2 + 32 * 2 + 32 * 2)
  const v = signature.substr(64 * 2)
  const r = signature.substr(0, 32 * 2)
  const s = signature.substr(32 * 2, 32 * 2)
  return { v, r, s }
}

function packSignatures (array: any[]) {
  const length = strip0x(toHex(array.length))
  const msgLength = length.length === 1 ? `0${length}` : length
  let v = ''
  let r = ''
  let s = ''
  array.forEach(e => {
    v = v.concat(e.v)
    r = r.concat(e.r)
    s = s.concat(e.s)
  })
  return `0x${msgLength}${v}${r}${s}`
}
