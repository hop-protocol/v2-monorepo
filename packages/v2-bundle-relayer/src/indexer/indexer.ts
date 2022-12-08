import wait from 'wait'
import { EventsBaseDb } from '../db/eventsDb/EventsBaseDb'
import { Hop } from '@hop-protocol/v2-sdk'
import { db } from '../db'

const _startBlockOp = 3218800
const _startBlockEth = 16117269

export class Indexer {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000
  chainIds: any = {
    5: true, // goerli
    420: true // goerli optimism
  }

  constructor () {
    this.hop = new Hop('goerli', {
      batchBlocks: 10_000
    })
  }

  async start () {
    await this.syncer()
  }

  async syncer () {
    while (true) {
      try {
        console.log('syncer start')

        const eventsToSync: Record<string, EventsBaseDb<any>> = {
          BundleCommitted: db.bundleCommittedEventsDb,
          BundleForwarded: db.bundleForwardedEventsDb, // hub
          BundleReceived: db.bundleReceivedEventsDb, // hub
          BundleSet: db.bundleSetEventsDb, // hub
          FeesSentToHub: db.feesSentToHubEventsDb,
          MessageBundled: db.messageBundledEventsDb,
          MessageRelayed: db.messageRelayedEventsDb,
          MessageReverted: db.messageRevertedEventsDb,
          MessageSent: db.messageSentEventsDb
        }

        for (const eventName in eventsToSync) {
          const _db = eventsToSync[eventName]
          for (const _chainId in this.chainIds) {
            const chainId = Number(_chainId)
            const hubEvents = ['BundleForwarded', 'BundleReceived', 'BundleSet']
            if (hubEvents.includes(eventName)) {
              if (chainId !== 5) {
                continue
              }
            } else {
              if (chainId === 5) {
                continue
              }
            }

            // await _db.resetSyncState(chainId)
            const syncState = await _db.getSyncState(chainId)
            console.log('syncState', eventName, syncState)

            const provider = this.hop.providers[chainId === 5 ? 'ethereum' : 'optimism']
            let startBlock = chainId === 5 ? _startBlockEth : _startBlockOp
            let endBlock = await provider.getBlockNumber()
            if (syncState?.toBlock) {
              startBlock = syncState.toBlock + 1
              endBlock = await provider.getBlockNumber()
            }

            console.log('get', eventName, chainId, startBlock, endBlock)
            const events = await this.hop.getEvents(eventName, chainId, startBlock, endBlock)
            console.log('events', eventName, events.length)
            for (const event of events) {
              const key = _db.getKeyStringFromEvent(event)!
              await _db.updateEvent(key, event)
            }
            await _db.putSyncState(chainId, { fromBlock: startBlock, toBlock: endBlock })
          }
        }
        console.log('syncer done')
      } catch (err: any) {
        console.error('syncer error:', err)
      }
      await wait(this.pollIntervalMs)
    }
  }
}
