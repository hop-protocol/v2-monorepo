import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from '../indexer'
import { db } from '../db'
import { goerliAddresses } from '@hop-protocol/v2-core/addresses'
import { signer } from '../signer'

class RelayError extends Error {}

export class Worker {
  sdk: Hop
  pollIntervalMs: number = 10 * 1000
  indexer: Indexer

  constructor () {
    this.sdk = new Hop('goerli')
    this.indexer = new Indexer({
      startBlocks: {
        5: goerliAddresses['5'].startBlock,
        420: goerliAddresses['420'].startBlock
      }
    })
  }

  async start () {
    try {
      this.indexer.start()
      await this.indexer.waitForSyncIndex(1)
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
    const items = await db.exitableBundlesDb.getItems()
    console.log('items', items.length)

    for (const bundleCommittedEvent of items) {
      const { bundleId, toChainId } = bundleCommittedEvent
      const { chainId: fromChainId } = bundleCommittedEvent.context
      console.log('checking shouldAttemp for bundle', bundleId)
      const shouldAttempt = true // await this.sdk.shouldAttemptForwardMessage(fromChainId, bundleCommittedEvent as any)

      console.log('shouldAttempt:', shouldAttempt, bundleId)
      if (shouldAttempt) {
        const bundleSet = await this.sdk.getIsBundleSet({ fromChainId, toChainId, bundleId })
        if (bundleSet) {
          await db.exitableBundlesDb.deleteItem(bundleId)
          throw new RelayError('bundle already set')
        }

        await db.txStateDb.putTxState(bundleId, {
          id: bundleId,
          lastAttemptedAtMs: Date.now()
        })

        let txData: any
        try {
          console.log('getting getBundleExitPopulatedTx')
          txData = await this.sdk.getBundleExitPopulatedTx({ fromChainId, bundleCommittedEvent })
          console.log('txData', txData)
        } catch (err: any) {
          if (/unable to find state root batch for tx with hash/.test(err.message)) {
            throw new RelayError('skipping, not ready yet to be relayed')
          }
        }

        const provider = this.sdk.getRpcProvider(toChainId)
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

        await db.txStateDb.updateTxState(bundleId, {
          id: bundleId,
          transactionHash: tx?.hash
        })
        console.log('updated txState', tx?.hash)
      }
    }
  }
}
