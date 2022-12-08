import { EventContext } from './types'
import { EventFetcher, InputFilter } from '../eventFetcher'
import { chainSlugMap } from '../utils/chainSlugMap'
import { providers } from 'ethers'

export class Event {
  provider: providers.Provider
  chainId: number
  batchBlocks: number
  address: string

  constructor (provider: any, chainId: number, batchBlocks: number, address: string) {
    if (!provider) {
      throw new Error('expected provider')
    }
    this.provider = provider
    this.chainId = chainId
    this.batchBlocks = batchBlocks
    this.address = address
  }

  async _getEvents (filter: any, startBlock: number, endBlock?: number) {
    const eventFetcher = new EventFetcher({
      provider: this.provider,
      batchBlocks: this.batchBlocks
    })
    if (!endBlock) {
      endBlock = await this.provider.getBlockNumber()
    }
    let events = await eventFetcher.fetchEvents([filter as InputFilter], { startBlock, endBlock })
    events = events.map(this.toTypedEvent)
    return Promise.all(events.map((event: any) => this.addContextToEvent(event, this.chainId)))
  }

  toTypedEvent (ethersEvent: any): any {
    throw new Error('Not implemented')
  }

  async addContextToEvent (event: any, chainId: number): Promise<any> {
    const context = await this.getEventContext(event._event, chainId)
    event.context = context
    return event
  }

  async getEventContext (event: any, chainId: number): Promise<EventContext> {
    const chainSlug = this.getChainSlug(chainId)
    const transactionHash = event.transactionHash
    const transactionIndex = event.transactionIndex
    const logIndex = event.logIndex
    const blockNumber = event.blockNumber
    const { timestamp: blockTimestamp } = await this.provider.getBlock(blockNumber)

    return {
      chainSlug,
      chainId,
      transactionHash,
      transactionIndex,
      logIndex,
      blockNumber,
      blockTimestamp
    }
  }

  getChainSlug (chainId: number) {
    const chainSlug = chainSlugMap[chainId]
    if (!chainSlug) {
      throw new Error(`Invalid chain: ${chainId}`)
    }
    return chainSlug
  }
}
