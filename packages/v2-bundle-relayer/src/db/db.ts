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
import { dbPath } from '../config'

const instances: Record<string, EventsBaseDb<any>> = {}

function getDb (DbClass: any) {
  const dbName = DbClass.name
  if (instances[dbName]) {
    return instances[dbName]
  }

  const db = new DbClass(dbPath)
  instances[dbName] = db
  return db
}

export const db = {
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
  }
}
