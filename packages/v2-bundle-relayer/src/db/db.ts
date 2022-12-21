import { BundleCommittedEventsDb } from './eventsDb/BundleCommittedEventsDb'
import { BundleForwardedEventsDb } from './eventsDb/BundleForwardedEventsDb'
import { BundleReceivedEventsDb } from './eventsDb/BundleReceivedEventsDb'
import { BundleSetEventsDb } from './eventsDb/BundleSetEventsDb'
import { EventsBaseDb } from './eventsDb/EventsBaseDb'
import { FeesSentToHubEventsDb } from './eventsDb/FeesSentToHubEventsDb'
import { MessageBundledEventsDb } from './eventsDb/MessageBundledEventsDb'
import { MessageRelayedEventsDb } from './eventsDb/MessageRelayedEventsDb'
import { MessageRevertedEventsDb } from './eventsDb/MessageRevertedEventsDb'
import { MessageSentEventsDb } from './eventsDb/MessageSentEventsDb'
import { RelayableBundlesDb } from './relayableBundlesDb/RelayableBundlesDb'
import { TxStateDb } from './txStateDb/TxStateDb'
import { dbPath as _configDbPath } from '../config'

let configDbPath = _configDbPath
const instances: Record<string, EventsBaseDb<any> | TxStateDb | RelayableBundlesDb> = {}

function getDb (DbClass: any) {
  const dbName = DbClass.name
  if (instances[dbName]) {
    return instances[dbName]
  }

  const db = new DbClass(configDbPath)
  instances[dbName] = db
  return db
}

export const db = {
  setDbPath (dbPath: string) {
    if (Object.keys(instances).length > 0) {
      throw new Error('dbPath can only be set before any db instance is created')
    }
    configDbPath = dbPath
  },
  get bundleCommittedEventsDb (): BundleCommittedEventsDb {
    return getDb(BundleCommittedEventsDb)
  },
  get bundleForwardedEventsDb (): BundleForwardedEventsDb {
    return getDb(BundleForwardedEventsDb)
  },
  get bundleReceivedEventsDb (): BundleReceivedEventsDb {
    return getDb(BundleReceivedEventsDb)
  },
  get bundleSetEventsDb (): BundleSetEventsDb {
    return getDb(BundleSetEventsDb)
  },
  get feesSentToHubEventsDb (): FeesSentToHubEventsDb {
    return getDb(FeesSentToHubEventsDb)
  },
  get messageBundledEventsDb (): MessageBundledEventsDb {
    return getDb(MessageBundledEventsDb)
  },
  get messageRelayedEventsDb (): MessageRelayedEventsDb {
    return getDb(MessageRelayedEventsDb)
  },
  get messageRevertedEventsDb (): MessageRevertedEventsDb {
    return getDb(MessageRevertedEventsDb)
  },
  get messageSentEventsDb (): MessageSentEventsDb {
    return getDb(MessageSentEventsDb)
  },
  get txStateDb (): TxStateDb {
    return getDb(TxStateDb)
  },
  get relayableBundlesDb (): RelayableBundlesDb {
    const _db = getDb(RelayableBundlesDb)
    if (!_db.otherDbs) {
      _db.otherDbs = db
    }
    return _db
  }
}
