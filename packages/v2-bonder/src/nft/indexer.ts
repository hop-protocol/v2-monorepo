import wait from 'wait'
import { Hop } from '@hop-protocol/v2-sdk'
import { SyncStateDb } from '../db/syncStateDb'
import { db } from '../db'
import { dbPath, sdkContractAddresses } from 'src/config'
import { pgDb } from '../pgDb'

type StartBlocks = {
  [chainId: string]: number
}

type EndBlocks = {
  [chainId: string]: number
}

type Options = {
  dbPath?: string
  startBlocks: StartBlocks
  endBlocks?: EndBlocks // used for testing
  pollIntervalSeconds?: number
  sdkContractAddresses?: any
}

export const defaultPollSeconds = 10

export class Indexer {
  sdk: Hop
  pollIntervalMs: number = defaultPollSeconds * 1000
  startBlocks: StartBlocks = {}
  endBlocks: EndBlocks = {}
  chainIds: any = {
    5: true, // goerli
    420: true // goerli optimism
  }

  paused: boolean = false
  syncIndex: number = 0
  db = db
  pgDb = pgDb
  eventsToSync: Record<string, any>

  constructor (options?: Options) {
    if (options?.pollIntervalSeconds) {
      this.pollIntervalMs = options?.pollIntervalSeconds * 1000
    }
    this.sdk = new Hop('goerli', {
      batchBlocks: 10_000,
      contractAddresses: options?.sdkContractAddresses ?? sdkContractAddresses
    })
    if (options?.startBlocks) {
      this.startBlocks = options.startBlocks
    }
    for (const chainId in this.chainIds) {
      this.startBlocks[chainId] = this.startBlocks[chainId] ?? 0
    }
    if (options?.endBlocks) {
      this.endBlocks = options.endBlocks
    }
    for (const chainId in this.chainIds) {
      this.endBlocks[chainId] = this.endBlocks[chainId] ?? 0
    }
    if (options?.dbPath) {
      this.db.setDbPath(options.dbPath)
    }

    this.eventsToSync = {
      tokenSent: new SyncStateDb(dbPath, 'NftTokenSent'),
      confirmationSent: new SyncStateDb(dbPath, 'NftConfirmationSent'),
      tokenConfirmed: new SyncStateDb(dbPath, 'NftConfirmationSent')
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

  async syncEvents (): Promise<any[]> {
    const baseEvents = [
      'TokenSent',
      'TokenConfirmed',
      'ConfirmationSent'
    ]

    const _events: any[] = []

    for (const _chainId in this.chainIds) {
      const chainId = Number(_chainId)
      const _db = this.eventsToSync[baseEvents[0]]
      const eventNames = baseEvents

      if (!_db) {
        continue
      }

      const syncState = await _db.getSyncState(chainId)
      console.log('syncState', chainId, syncState)

      const provider = this.sdk.getRpcProvider(chainId)
      let fromBlock = this.startBlocks[chainId]
      let headBlock = await provider.getBlockNumber()
      if (this.endBlocks[chainId]) {
        headBlock = this.endBlocks[chainId]
      }
      let toBlock = headBlock
      if (syncState?.toBlock) {
        fromBlock = Number(syncState.toBlock) + 1
        toBlock = headBlock
      }

      console.log('get', eventNames, chainId, fromBlock, toBlock)
      const events = await this.sdk.getEvents({ eventNames, chainId, fromBlock, toBlock })
      console.log('events', eventNames, events.length)
      for (const event of events) {
        const _db = this.eventsToSync[event.eventName]
        const key = _db.getKeyStringFromEvent(event)!
        await _db.updateEvent(key, event)
        await _db.putSyncState(chainId, { fromBlock, toBlock })
        _events.push(event)
      }
      await _db.putSyncState(chainId, { fromBlock, toBlock })
    }

    return _events
  }

  async poll () {
    console.log('poll start')

    const events = await this.syncEvents()
    const exitableBundles: any = {}

    for (const event of events) {
      if (event.eventName === 'BundleCommitted') {
        exitableBundles[event.bundleId] = true
      }
    }

    for (const event of events) {
      if (event.eventName === 'BundleSet') {
        exitableBundles[event.bundleId] = false
      }
    }

    for (const bundleId in exitableBundles) {
      if (exitableBundles[bundleId]) {
        await db.exitableBundlesDb.putItem(bundleId)
      } else {
        await db.exitableBundlesDb.deleteItem(bundleId)
      }
    }

    this.syncIndex++
    console.log('poll done')
  }
}
