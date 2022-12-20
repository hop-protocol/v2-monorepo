import wait from 'wait'
import { EventsBaseDb } from '../db/eventsDb/EventsBaseDb'
import { Hop } from '@hop-protocol/v2-sdk'
import { db } from '../db'

type StartBlocks = {
  [chainId: string]: number
}

type Options = {
  dbPath?: string
  startBlocks: StartBlocks
}

export class Indexer {
  hop: Hop
  pollIntervalMs: number = 1 * 60 * 1000
  startBlocks: StartBlocks = {}
  chainIds: any = {
    5: true, // goerli
    420: true // goerli optimism
  }

  paused: boolean = false
  syncIndex: number = 0
  db = db
  eventsToSync: Record<string, EventsBaseDb<any>>

  constructor (options?: Options) {
    this.hop = new Hop('goerli', {
      batchBlocks: 2_000
    })
    if (options?.startBlocks) {
      this.startBlocks = options.startBlocks
    }
    for (const chainId in this.chainIds) {
      this.startBlocks[chainId] = this.startBlocks[chainId] ?? 0
    }
    if (options?.dbPath) {
      this.db.setDbPath(options.dbPath)
    }

    this.eventsToSync = {
      BundleCommitted: this.db.bundleCommittedEventsDb,
      BundleForwarded: this.db.bundleForwardedEventsDb, // hub
      BundleReceived: this.db.bundleReceivedEventsDb, // hub
      BundleSet: this.db.bundleSetEventsDb, // hub
      FeesSentToHub: this.db.feesSentToHubEventsDb,
      MessageBundled: this.db.messageBundledEventsDb,
      MessageRelayed: this.db.messageRelayedEventsDb,
      MessageReverted: this.db.messageRevertedEventsDb,
      MessageSent: this.db.messageSentEventsDb
    }
  }

  async start () {
    this.paused = false
    await this.startPoller()
  }

  async stop () {
    this.paused = true
  }

  async startPoller () {
    while (true) {
      if (this.paused) {
        return
      }
      try {
        await this.poll()
      } catch (err: any) {
        console.error('indexer poll error:', err)
      }
      await wait(this.pollIntervalMs)
    }
  }

  async poll () {
    console.log('poll start')

    for (const eventName in this.eventsToSync) {
      const _db = this.eventsToSync[eventName]
      for (const _chainId in this.chainIds) {
        const chainId = Number(_chainId)

        await this.syncChainEvents(chainId, eventName, _db)
      }
    }
    this.syncIndex++
    console.log('poll done')
  }

  async syncChainEvents (chainId: number, eventName: string, _db: EventsBaseDb<any>) {
    const isL1 = this.getIsL1(chainId)
    const hubEvents = ['BundleForwarded', 'BundleReceived', 'BundleSet']
    if (hubEvents.includes(eventName)) {
      if (!isL1) {
        return
      }
    } else {
      if (isL1) {
        return
      }
    }

    // await _db.resetSyncState(chainId)
    const syncState = await _db.getSyncState(chainId)
    console.log('syncState', eventName, syncState)

    const provider = this.hop.getRpcProvider(chainId)
    let startBlock = this.startBlocks[chainId]
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

  async waitForSyncIndex (syncIndex: number): Promise<boolean> {
    if (this.syncIndex === syncIndex) {
      return true
    }

    await wait(100)
    return await this.waitForSyncIndex(syncIndex)
  }

  getIsL1 (chainId: number) {
    return chainId === 5 || chainId === 1
  }
}
