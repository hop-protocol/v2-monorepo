import { Filter } from '@ethersproject/abstract-provider'
import { getAddress } from 'ethers/lib/utils'
import { promiseQueue } from './promiseQueue'
import { providers } from 'ethers'

const DefaultBatchBlocks = 2000

export type Options = {
  provider: providers.Provider
  batchBlocks?: number
}

export type FetchOptions = {
  startBlock: number
  endBlock: number
}

export type InputFilter = {
  address: string
  topics: (string | string[])[]
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

  async fetchEvents (filters: InputFilter[], options: FetchOptions) {
    const startBlock = options.startBlock
    const endBlock = options.endBlock
    const events :any[] = []
    let batchStart = startBlock
    let batchEnd = Math.min(batchStart + this.batchBlocks, endBlock)

    const promises :any[] = []
    while (batchEnd <= endBlock) {
      const batchOptions = {
        startBlock: batchStart,
        endBlock: batchEnd
      }

      const aggregatedFilters = this.aggregateFilters(filters, batchOptions)
      const batchedEventsFn = () => this.fetchEventsWithAggregatedFilters(aggregatedFilters)
      promises.push(batchedEventsFn)
      batchStart = batchEnd
      batchEnd = batchStart + this.batchBlocks
    }

    await promiseQueue(promises, async (fn: any) => {
      const batchedEvents = await fn()
      events.push(...batchedEvents)
    }, { concurrency: 20 })

    return events
  }

  aggregateFilters (filters: InputFilter[], options: FetchOptions): Filter[] {
    const startBlock = options.startBlock
    const endBlock = options.endBlock
    const filtersByAddress :Record<string, Partial<Filter>> = {}

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
        const topics: (string | string[])[] = obj.topics ?? []
        if (filter.topics) {
          for (let i = 0; i < filter.topics.length; i++) {
            const topic : any = filter.topics[i]
            if (!topics[i]) {
              topics[i] = []
            }
            if (!topics[i].includes(topic)) {
              (topics[i] as string[]).push(topic)
            }
          }
        }
        obj.topics = topics
        filtersByAddress[address] = obj
      }
    }

    const aggregatedFilters: Filter[] = []
    for (const address in filtersByAddress) {
      const filter = filtersByAddress[address]
      aggregatedFilters.push({ ...filter, fromBlock: startBlock, toBlock: endBlock })
    }

    return aggregatedFilters
  }

  private async fetchEventsWithAggregatedFilters (aggregatedFilters: Filter[]) {
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
