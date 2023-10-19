import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from '../indexer'
import { goerliAddresses } from '@hop-protocol/v2-core/addresses'

export type Options = {
  indexerPollSeconds?: number
}

export const defaultPollSeconds = 10

export class Worker {
  sdk: Hop
  pollIntervalMs: number = defaultPollSeconds * 1000
  indexer: Indexer

  constructor (options: Options = {}) {
    this.sdk = new Hop('goerli')
    this.indexer = new Indexer({
      pollIntervalSeconds: options.indexerPollSeconds,
      startBlocks: {
        5: goerliAddresses['5'].startBlock,
        420: goerliAddresses['420'].startBlock
      }
    })
  }

  async start () {
    try {
      this.indexer.start()
    } catch (err: any) {
      console.error('worker poll error', err)
    }
  }
}
