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
  it('getBundleCommittedEvents', async () => {
    const hop = new Hop('goerli')
    const chain = 'optimism'
    const endBlock = await hop.providers[chain].getBlockNumber()
    const startBlock = endBlock - 100
    const events = await hop.getBundleCommittedEvents(chain, startBlock, endBlock)
    expect(events).toStrictEqual([])
  }, 60 * 1000)
  it('sendMessage', async () => {
    const signer = new Wallet(privateKey)
    const hop = new Hop('goerli')
    const provider = await hop.providers.optimism
    const fromChainId = 420
    const toChainId = 5
    const toAddress = '0x0000000000000000000000000000000000000000'
    const toData = '0x'
    const fee = parseEther('0.000001')
    const txData = await hop.getSendMessagePopulatedTx(fromChainId, toChainId, toAddress, toData)
    expect(txData.data.startsWith('0x7056f41f')).toBe(true)
    expect(txData.to).toBe('0x4b844c25EF430e71D42EEA89d87Ffe929f8db927')
    const shouldSend = false
    if (shouldSend) {
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
    const chain = 'optimism'
    const endBlock = 3216770
    const startBlock = endBlock - 100
    const events = await hop.getMessageBundledEvents(chain, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].bundleId).toBe('0x941b97adc8856fc13c566e5b9aaa9cd5fd953324452f0aa1fe24ca227a5e2ab6')
    expect(events[0].treeIndex).toBe(0)
    expect(events[0].messageId).toBe('0x1dcab020e2c5973e3461028e6d6cce6e8785c18c8d47257836800170d37b9e3e')
    expect(events[0]._event).toBeTruthy()
  }, 60 * 1000)
  it('getMessageSentEvents', async () => {
    const hop = new Hop('goerli')
    const chain = 'optimism'
    const endBlock = 3216770
    const startBlock = endBlock - 100
    const events = await hop.getMessageSentEvents(chain, startBlock, endBlock)
    console.log(events)
    expect(events.length).toBe(1)
    expect(events[0].messageId).toBe('0x1dcab020e2c5973e3461028e6d6cce6e8785c18c8d47257836800170d37b9e3e')
    expect(events[0].from).toBe('0x75f222420C75Da8a59091a23368f97De43F54D9b')
    expect(events[0].toChainId).toBe(5)
    expect(events[0].data).toBe('0x')
    expect(events[0]._event).toBeTruthy()
  }, 60 * 1000)
})
