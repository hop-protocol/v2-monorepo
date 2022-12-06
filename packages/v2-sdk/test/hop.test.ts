import pkg from '../package.json'
import { Hop } from '../src/index'
import { Wallet } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
require('dotenv').config()

const privateKey = process.env.PRIVATE_KEY

describe('sdk setup', () => {
  it('should return version', () => {
    const hop = new Hop()
    expect(hop.version).toBe(pkg.version)
  })
  it('getSendMessagePopulatedTx', async () => {
    const hop = new Hop('goerli')
    const fromChainId = 420
    const toChainId = 5
    const toAddress = '0x0000000000000000000000000000000000000000'
    const toData = '0x'
    const txData = await hop.getSendMessagePopulatedTx(fromChainId, toChainId, toAddress, toData)
    expect(txData.data.startsWith('0x7056f41f')).toBe(true)
    expect(txData.to).toBe('0x4b844c25EF430e71D42EEA89d87Ffe929f8db927')
    const shouldSend = false
    if (shouldSend) {
      const signer = new Wallet(privateKey)
      const provider = hop.providers.optimism
      const fee = parseEther('0.000001')
      const tx = await signer.connect(provider).sendTransaction({
        to: txData.to,
        data: txData.data,
        value: fee
      })
      console.log(tx)
      expect(tx.hash).toBeTruthy()
    }
  }, 60 * 1000)
  it('getMessageBundledEvents', async () => {
    const hop = new Hop('goerli')
    const chainId = 420
    const chain = 'optimism'
    const endBlock = 3216770
    const startBlock = endBlock - 100
    const events = await hop.getMessageBundledEvents(chainId, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].bundleId).toBe('0x941b97adc8856fc13c566e5b9aaa9cd5fd953324452f0aa1fe24ca227a5e2ab6')
    expect(events[0].treeIndex).toBe(0)
    expect(events[0].messageId).toBe('0x1dcab020e2c5973e3461028e6d6cce6e8785c18c8d47257836800170d37b9e3e')
    expect(events[0]._event).toBeTruthy()
  }, 60 * 1000)
  it('getMessageSentEvents', async () => {
    const hop = new Hop('goerli')
    const chainId = 420
    const chain = 'optimism'
    const endBlock = 3216770
    const startBlock = endBlock - 100
    const events = await hop.getMessageSentEvents(chainId, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].messageId).toBe('0x1dcab020e2c5973e3461028e6d6cce6e8785c18c8d47257836800170d37b9e3e')
    expect(events[0].from).toBe('0x75f222420C75Da8a59091a23368f97De43F54D9b')
    expect(events[0].toChainId).toBe(5)
    expect(events[0].data).toBe('0x')
    expect(events[0]._event).toBeTruthy()
  }, 60 * 1000)
  it('getBundleCommittedEvents', async () => {
    const hop = new Hop('goerli')
    const chain = 'optimism'
    const chainId = 420
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const events = await hop.getBundleCommittedEvents(chainId, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].bundleId).toBe('0x941b97adc8856fc13c566e5b9aaa9cd5fd953324452f0aa1fe24ca227a5e2ab6')
    expect(events[0].bundleRoot).toBe('0x1ff2a2c860acb0772ae0aa3971f114f48a7df7649c3ee8978c41c3577c3dd0c8')
    expect(events[0].bundleFees.toString()).toBe('8000000000000')
    expect(events[0].toChainId).toBe(5)
    expect(events[0].commitTime).toBe(1670287396)
    expect(events[0].context).toBeTruthy()
    expect(events[0]._event).toBeTruthy()
  }, 60 * 1000)
  it('getFeesSentToHubEvents', async () => {
    const hop = new Hop('goerli')
    const chainId = 420
    const chain = 'optimism'
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const events = await hop.getFeesSentToHubEvents(chainId, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].amount.toString()).toBe('8000000000000')
  }, 60 * 1000)
  it('getEstimatedTxCostForForwardMessage', async () => {
    const hop = new Hop('goerli')
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const chainId = 420
    const chain = 'optimism'
    const toChain = 'ethereum'
    const toChainId = 5
    const [bundleCommittedEvent] = await hop.getBundleCommittedEvents(chainId, startBlock, endBlock)
    const estimatedTxCost = await hop.getEstimatedTxCostForForwardMessage(toChainId, bundleCommittedEvent)
    console.log(estimatedTxCost)
    expect(estimatedTxCost).toBeGreaterThan(0)
  }, 60 * 1000)
  it('getRelayReward', async () => {
    const hop = new Hop('goerli')
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const chain = 'optimism'
    const fromChainId = 420
    const [bundleCommittedEvent] = await hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
    const amount = await hop.getRelayReward(fromChainId, bundleCommittedEvent)
    console.log(amount)
    expect(typeof amount).toBe('number')
  }, 60 * 1000)
  it('shouldAttemptForwardMessage', async () => {
    const hop = new Hop('goerli')
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const chain = 'optimism'
    const fromChainId = 420
    const [bundleCommittedEvent] = await hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
    const shouldAttempt = await hop.shouldAttemptForwardMessage(fromChainId, bundleCommittedEvent)
    console.log(shouldAttempt)
    expect(shouldAttempt).toBe(false)
  }, 60 * 1000)
  it.skip('getRelayBundlePopulatedTx', async () => {
    const hop = new Hop('goerli')
    const chain = 'optimism'
    const fromChainId = 420
    const endBlock = 3218900
    const startBlock = endBlock - 100
    const [bundleCommittedEvent] = await hop.getBundleCommittedEvents(fromChainId, startBlock, endBlock)
    const txData = await hop.getBundleExitPopulatedTx(fromChainId, bundleCommittedEvent)
    console.log(txData)
    expect(txData.data).toBeTruthy()
    expect(txData.to).toBeTruthy()
    const shouldSend = false
    if (shouldSend) {
      const signer = new Wallet(privateKey)
      const provider = hop.providers.ethereum
      const tx = await signer.connect(provider).sendTransaction({
        to: txData.to,
        data: txData.data,
        value: '0'
      })
      console.log(tx)
      expect(tx.hash).toBeTruthy()
    }
  }, 60 * 1000)
})
