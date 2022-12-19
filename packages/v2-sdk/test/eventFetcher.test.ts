import { EventFetcher } from '../src/eventFetcher'
import { getAddress } from 'ethers/lib/utils'
import { providers } from 'ethers'
require('dotenv').config()

const rpcUrl = process.env.ETHEREUM_RPC_PROVIDER

describe('EventFetcher', () => {
  it('should fetch all events from multiple filters and aggregate filter topics', async () => {
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const eventFetcher = new EventFetcher({
      provider
    })
    const endBlock = 16072238
    const startBlock = endBlock - 50
    const filter1 = {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer
      ]
    }
    const filter2 = {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer
      ]
    }
    const filter3 = {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925' // Approval
      ]
    }

    const filters = [
      filter1,
      filter2,
      filter3,
      filter3 // add duplicate filter to test deduplication
    ]

    const options = {
      startBlock,
      endBlock
    }

    const aggregatedFilters = eventFetcher.aggregateFilters(filters, options)
    expect(aggregatedFilters).toEqual([
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        topics: [
          [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
          ]
        ],
        fromBlock: 16072188,
        toBlock: 16072238
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        topics: [
          [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          ]
        ],
        fromBlock: 16072188,
        toBlock: 16072238
      }
    ])

    const events = await eventFetcher.fetchEvents(filters, options)

    const seen : Record<string, boolean> = {}
    for (const filter of filters) {
      for (const event of events) {
        const filterKey = `${getAddress(filter.address)}-${filter.topics[0]}`
        const eventKey = `${event.address}-${event.topics[0]}`
        if (filterKey === eventKey) {
          seen[filterKey] = true
        }
      }
    }

    const seenFilterKeys = Object.keys(seen).length
    expect(seenFilterKeys).toBe(3)

    const events1 = await provider.getLogs({ ...filter1, fromBlock: startBlock, toBlock: endBlock })
    const events2 = await provider.getLogs({ ...filter2, fromBlock: startBlock, toBlock: endBlock })
    const events3 = await provider.getLogs({ ...filter3, fromBlock: startBlock, toBlock: endBlock })
    const expectedTotalEvents = events1.length + events2.length + events3.length
    expect(expectedTotalEvents).toBe(1725)
    expect(events.length).toBe(expectedTotalEvents)
  }, 60 * 1000)

  // TODO: handle infura error '"code":-32000,"message":"query returned more than 10000 results"'
  it.skip('should fetch all events regardless of block range', async () => {
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const eventFetcher = new EventFetcher({
      provider
    })
    const endBlock = 16072238
    const startBlock = endBlock - 11000 // should be >10k block range
    const filter1 = {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer
      ]
    }

    const filters = [filter1]
    const options = {
      startBlock,
      endBlock
    }

    const events = await eventFetcher.fetchEvents(filters, options)
    expect(events.length).toBe(127889)
  }, 60 * 1000)

  it('should get correct block range for small range', async () => {
    const batchBlocks = 2000
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const eventFetcher = new EventFetcher({
      provider,
      batchBlocks
    })
    const endBlock = 16072238
    const startBlock = endBlock - 1
    const blockRanges = eventFetcher.getChunkedBlockRanges(startBlock, endBlock)
    expect(blockRanges.length).toBe(1)
    expect(JSON.stringify(blockRanges)).toBe(JSON.stringify([[startBlock, endBlock]]))
  })

  it('should get correct block range for same values', async () => {
    const batchBlocks = 2000
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const eventFetcher = new EventFetcher({
      provider,
      batchBlocks
    })
    const endBlock = 16072238
    const startBlock = endBlock
    const blockRanges = eventFetcher.getChunkedBlockRanges(startBlock, endBlock)
    expect(blockRanges.length).toBe(1)
    expect(JSON.stringify(blockRanges)).toBe(JSON.stringify([[startBlock, endBlock]]))
  })

  it('should get correct block range for startBlock > endBlock', async () => {
    const batchBlocks = 2000
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const eventFetcher = new EventFetcher({
      provider,
      batchBlocks
    })
    const endBlock = 16072238
    const startBlock = endBlock + 100
    const blockRanges = eventFetcher.getChunkedBlockRanges(startBlock, endBlock)
    expect(blockRanges.length).toBe(1)
    expect(JSON.stringify(blockRanges)).toBe(JSON.stringify([[endBlock, endBlock]]))
  })

  it('should get correct chunked blocked range for large range', async () => {
    const endBlock = 16072238
    const startBlock = endBlock - 11000
    const provider = new providers.StaticJsonRpcProvider(rpcUrl)
    const batchBlocks = 2000
    const eventFetcher = new EventFetcher({
      provider,
      batchBlocks
    })
    const blockRanges = eventFetcher.getChunkedBlockRanges(startBlock, endBlock)
    const expectedRanges = [
      [startBlock, startBlock + (batchBlocks * 1)],
      [startBlock + (batchBlocks * 1), startBlock + (batchBlocks * 2)],
      [startBlock + (batchBlocks * 2), startBlock + (batchBlocks * 3)],
      [startBlock + (batchBlocks * 3), startBlock + (batchBlocks * 4)],
      [startBlock + (batchBlocks * 4), startBlock + (batchBlocks * 5)],
      [startBlock + (batchBlocks * 5), endBlock]
    ]

    expect(blockRanges.length).toBe(6) // (endBlock-startBlock)/2000
    expect(JSON.stringify(blockRanges)).toBe(JSON.stringify(expectedRanges))
  }, 60 * 1000)
})
