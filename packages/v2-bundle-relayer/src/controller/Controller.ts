import { BigNumber } from 'ethers'
import { DateTime } from 'luxon'
import { db } from '../db'
import { formatUnits } from 'ethers/lib/utils'
import { truncateString } from '../utils/truncateString'

type EventsResult = {
  firstKey: string | null
  lastKey: string | null
  items: any[]
}

export class Controller {
  db: any
  events: any

  constructor () {
    this.db = db
    this.events = {
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

  async _getEvents (eventsDb: any, limit: number = 10, _lastKey: string | null = '~', _firstKey: string | null = ''): Promise<EventsResult> {
    if (typeof limit !== 'number') {
      throw new Error('limit must be a number')
    }

    if (_lastKey && typeof _lastKey !== 'string') {
      throw new Error('lastKey must be a string')
    }

    if (!_lastKey) {
      _lastKey = '~'
    }

    if (!_firstKey) {
      _firstKey = ''
    }

    let filter = {}

    if (_firstKey) {
      filter = {
        gt: _firstKey,
        lt: '~',
        reverse: false,
        limit: limit
      }
    } else if (_lastKey) {
      filter = {
        gt: '',
        lt: _lastKey,
        reverse: true,
        limit: limit
      }
    }

    let items: any[] = await eventsDb.timestampDb._getKeyValues(filter)
    if (_firstKey) {
      items = items.reverse()
    }
    items = items.filter((item: any) => !!item.key)
    const ids = items.map((item: any) => item.value.id)
    let lastKey = items.length > 0 ? items[items.length - 1].key : null

    const firstItem = await eventsDb.timestampDb._getKeyValues({
      gt: '',
      lt: '~',
      reverse: true,
      limit: 1
    })

    let firstKey = items.length > 0 ? items[0].key : null
    if (firstKey === firstItem?.[0]?.key) {
      firstKey = null
    }
    items = await eventsDb.getEventsFromIds(ids)
    if (items.length < limit) {
      lastKey = null
    }

    return {
      firstKey,
      lastKey,
      items
    }
  }

  async getEventNames () {
    return Object.keys(this.events)
  }

  async getEvents (eventName: string, limit: number = 10, lastKey: string | null = '~', firstKey: string | null = ''): Promise<EventsResult> {
    const eventsDb = this.events[eventName]
    if (!eventsDb) {
      throw new Error(`event name ${eventName} not found`)
    }
    return this._getEvents(eventsDb, limit, lastKey, firstKey)
  }

  async getEventsForApi (eventName: string, limit: number = 10, _lastKey: string | null = '~', _firstKey: string | null = ''): Promise<EventsResult> {
    const { items, lastKey, firstKey } = await this.getEvents(eventName, limit, _lastKey, _firstKey)

    const chainNames: any = {
      1: 'Ethereum (Mainnet)',
      10: 'Optimism (Mainnet)',
      420: 'Optimism (Goerli)',
      5: 'Ethereum (Goerli)'
    }

    for (const item of items) {
      if (item.messageId) {
        item.messageIdTruncated = truncateString(item.messageId, 4)
      }
      if (item.bundleId) {
        item.bundleIdTruncated = truncateString(item.bundleId, 4)
      }
      if (item.bundleRoot) {
        item.bundleRootTruncated = truncateString(item.bundleRoot, 4)
      }
      if (item.relayer) {
        item.relayerTruncated = truncateString(item.relayer, 4)
      }
      if (item.from) {
        item.fromTruncated = truncateString(item.from, 4)
      }
      if (item.to) {
        item.toTruncated = truncateString(item.to, 4)
      }
      if (item.chainId) {
        item.chainName = chainNames[item.chainId]
      }
      if (item.fromChainId) {
        item.fromChainName = chainNames[item.fromChainId]
      }
      if (item.toChainId) {
        item.toChainName = chainNames[item.toChainId]
      }
      if (item.bundleFees) {
        item.bundleFeesDisplay = formatUnits(item.bundleFees, 18)
      }
      if (item.context?.blockTimestamp) {
        item.context.blockTimestampRelative = DateTime.fromSeconds(item.context.blockTimestamp).toRelative()
      }
    }

    return {
      items: items.map(this.normalizeEventForApi),
      lastKey,
      firstKey
    }
  }

  normalizeEventForApi (event: any) {
    for (const key in event) {
      if (BigNumber.isBigNumber(event[key])) {
        event[key] = event[key].toString()
      }
    }
    return event
  }

  async getFilteredEvents (eventName: string, filter: any): Promise<any | null> {
    const eventsDb = this.events[eventName]

    if (filter.messageId) {
      if (eventName === 'MessageSent' || eventName === 'MessageRelayed' || eventName === 'MessageReverted') {
        return eventsDb.getEvent(filter.messageId)
      } else if (eventName === 'MessageBundled') {
        return eventsDb.getEventByPropertyIndex('messageId', filter.messageId)
      }
    } else if (filter.bundleRoot) {
      if (eventName === 'BundleCommitted' || eventName === 'BundleForwarded' || eventName === 'BundleReceived' || eventName === 'BundleSet') {
        return eventsDb.getEventByPropertyIndex('bundleRoot', filter.bundleRoot)
      }
    } else if (filter.transactionHash) {
      return eventsDb.getEventByTransactionHash(filter.transactionHash)
    }

    return null
  }
}
