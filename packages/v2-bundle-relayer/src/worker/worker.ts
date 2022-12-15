import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { Indexer } from '../indexer'
import { db } from '../db'
import { goerliAddresses } from '@hop-protocol/v2-core/addresses'
import { signer } from '../signer'

export class Worker {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000
  indexer: Indexer

  constructor () {
    this.hop = new Hop('goerli')
    this.indexer = new Indexer({
      startBlocks: {
        5: goerliAddresses.ethereum.startBlock,
        420: goerliAddresses.optimism.startBlock
      }
    })
  }

  async start () {
    try {
      this.indexer.start()
      await this.indexer.waitForSyncIndex(1)
      await this.poll()
    } catch (err: any) {
      console.error('worker poll error', err)
    }
  }

  async poll () {
    while (true) {
      try {
        console.log('poll start')
        const now = Math.floor(Date.now() / 1000)
        // TODO: only return if bundle is not set
        const items = await db.bundleCommittedEventsDb.getFromRange({
          lt: now,
          gt: now - (604800 * 2)
        })
        console.log('items', items.length)

        for (const bundleCommittedEvent of items) {
          const { bundleId, toChainId } = bundleCommittedEvent
          const { chainId: fromChainId } = bundleCommittedEvent.context
          console.log('checking shouldAttemp for bundle', bundleId)
          let shouldAttempt = await this.hop.shouldAttemptForwardMessage(fromChainId, bundleCommittedEvent as any)

          const bundleSetEvent = await db.bundleSetEventsDb.getEvent(bundleId)
          if (bundleSetEvent) {
            console.log('found bundleSetEvent for bundle')
            shouldAttempt = false
          }

          console.log('shouldAttempt:', shouldAttempt, bundleId, !!bundleForwardedEvent)
          if (shouldAttempt) {
            const txData = await this.hop.getBundleExitPopulatedTx(fromChainId, bundleCommittedEvent as any)
            console.log('txData', txData)

            const txState = await db.txStateDb.getTxState(bundleId)
            const delayMs = 10 * 60 * 1000 // 10min
            const recentlyAttempted = txState && (txState.lastAttemptedAtMs + delayMs > Date.now())
            const isOk = !txState || !recentlyAttempted
            if (!isOk) {
              throw new Error(`not ok, recently attempted: ${recentlyAttempted}`)
            }

            await db.txStateDb.putTxState(bundleId, {
              id: bundleId,
              lastAttemptedAtMs: Date.now()
            })

            const provider = toChainId === 5 ? this.hop.providers.ethereum : this.hop.providers.optimism
            const tx = await signer?.connect(provider).sendTransaction({
              to: txData.to,
              data: txData.data
            })

            console.log('sent tx', tx?.hash)

            await db.txStateDb.updateTxState(bundleId, {
              id: bundleId,
              transactionHash: tx?.hash
            })
            console.log('updated txState', tx?.hash)
          }
        }
      } catch (err: any) {
        console.error(err)
      }

      await wait(this.pollIntervalMs)
    }
  }
}
