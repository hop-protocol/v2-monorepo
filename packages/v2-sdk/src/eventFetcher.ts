import { getAddress } from 'ethers/lib/utils'
import { providers } from 'ethers'

const DefaultBatchBlocks = 2000

export type Options = {
  provider: providers.Provider
  batchBlocks: number
}

export type FetchOptions = {
  startBlock: number
  endBlock: number
}

export class EventFetcher {
  provider: providers.Provider
  batchBlocks: number = DefaultBatchBlocks

  constructor (options: Options) {
    if (!options.provider) {
      throw new Error('provider is required')
    }
    this.provider = options.provider

    if (options.batchBlocks) {
      this.batchBlocks = options.batchBlocks
    }
  }

  async fetchEvents (filters: any[], options: FetchOptions) {
    const aggregatedFilters = this.aggregateFilters(filters, options)
    return this.fetchEventsWithAggregatedFilters(aggregatedFilters)
  }

  aggregateFilters (filters: any[], options: FetchOptions) {
    const startBlock = options.startBlock
    const endBlock = options.endBlock
    const filtersByAddress :Record<string, any> = {}

    for (const filter of filters) {
      if (filter.address) {
        const address = getAddress(filter.address)
        if (!filtersByAddress[address]) {
          filtersByAddress[address] = {}
        }
        const obj = filtersByAddress[address]
        if (!obj.address) {
          obj.address = address
        }
        const topics = obj.topics ?? []
        if (filter.topics) {
          for (let i = 0; i < filter.topics.length; i++) {
            const topic = filter.topics[i]
            if (!topics[i]) {
              topics[i] = []
            }
            if (!topics[i].includes(topic)) {
              topics[i].push(topic)
            }
          }
        }
        obj.topics = topics
        filtersByAddress[address] = obj
      }
    }

    const aggregatedFilters = []
    for (const address in filtersByAddress) {
      const filter = filtersByAddress[address]
      aggregatedFilters.push({ ...filter, fromBlock: startBlock, toBlock: endBlock })
    }

    return aggregatedFilters
  }

  private async fetchEventsWithAggregatedFilters (aggregatedFilters: any[]) {
    const promises = []
    for (const filter of aggregatedFilters) {
      promises.push(this.provider.getLogs({ ...filter }))
    }

    const promiseResults = await Promise.all(promises)
    const result : any[] = []
    for (const events of promiseResults) {
      result.push(...events)
    }
    return result
  }
}
