import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from './indexer'
import { db } from '../db'
import { getSigner } from '../signer'
import { goerliAddresses } from '@hop-protocol/v2-core/addresses'
import { pgDb } from '../pgDb'

class RelayError extends Error {}

export type Options = {
  indexerPollSeconds?: number
  eventPollSeconds?: number
}

export const defaultPollSeconds = 10

export class Worker {
  sdk: Hop
  pollIntervalMs: number = defaultPollSeconds * 1000
  indexer: Indexer
  pgDb = pgDb

  constructor (options: Options = {}) {
    if (options.eventPollSeconds) {
      this.pollIntervalMs = options.eventPollSeconds * 1000
    }
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
      await this.startPoll()
    } catch (err: any) {
      console.error('worker poll error', err)
    }
  }

  async startPoll () {
    while (true) {
      try {
        await this.poll()
      } catch (err: any) {
        if (err instanceof RelayError) {
          console.warn(err.message)
        } else {
          console.error(err)
        }
      }

      await wait(this.pollIntervalMs)
    }
  }

  async poll () {
    console.log('poll start')
    const items = await this.pgDb.events.TokenSent.getItems()
    console.log('items', items.length)

    for (const event of items) {
      const { tokenId, toChainId } = event
      const { chainId: fromChainId } = event.context
      console.log('checking shouldAttemp for tokenId', tokenId)
      const shouldAttempt = true

      console.log('shouldAttempt:', shouldAttempt, tokenId)
      if (shouldAttempt) {
        await db.txStateDb.putTxState(tokenId, {
          id: tokenId,
          lastAttemptedAtMs: Date.now()
        })

        console.log('getting getNftConfirmPopulatedTx')
        const txData = await this.sdk.getNftConfirmPopulatedTx({ fromChainId, tokenId })
        console.log('txData', txData)

        const provider = this.sdk.getRpcProvider(toChainId)
        const signer = getSigner()
        if (!signer) {
          throw new Error('no signer connected')
        }

        const tx = await signer?.connect(provider).sendTransaction({
          to: txData.to,
          data: txData.data
        })

        if (!tx?.hash) {
          throw new Error('did not send tx')
        }

        console.log('sent tx', tx?.hash)

        await db.txStateDb.updateTxState(tokenId, {
          id: tokenId,
          transactionHash: tx?.hash
        })
        console.log('updated txState', tx?.hash)
      }
    }
  }
}
