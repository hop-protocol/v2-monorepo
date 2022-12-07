import { BundleCommittedEventsDb } from './BundleCommittedEventsDb'
import { BundleForwardedEventsDb } from './BundleForwardedEventsDb'
import { BundleReceivedEventsDb } from './BundleReceivedEventsDb'
import { BundleSetEventsDb } from './BundleSetEventsDb'
import { FeesSentToHubEventsDb } from './FeesSentToHubEventsDb'
import { MessageBundledEventsDb } from './MessageBundledEventsDb'
import { MessageRelayedEventsDb } from './MessageRelayedEventsDb'
import { MessageRevertedEventsDb } from './MessageRevertedEventsDb'
import { MessageSentEventsDb } from './MessageSentEventsDb'
import { dbPath } from '../config'

const instances: Record<string, any> = {}

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
  get bundleCommittedEventsDb () {
    return getDb(BundleCommittedEventsDb)
  },
  get bundleForwardedEventsDb () {
    return getDb(BundleForwardedEventsDb)
  },
  get bundleReceivedEventsDb () {
    return getDb(BundleReceivedEventsDb)
  },
  get bundleSetEventsDb () {
    return getDb(BundleSetEventsDb)
  },
  get feesSentToHubEventsDb () {
    return getDb(FeesSentToHubEventsDb)
  },
  get messageBundledEventsDb () {
    return getDb(MessageBundledEventsDb)
  },
  get messageSentEventsDb () {
    return getDb(MessageSentEventsDb)
  },
  get messageRelayedEventsDb () {
    return getDb(MessageRelayedEventsDb)
  },
  get messageRevertedEventsDb () {
    return getDb(MessageRevertedEventsDb)
  }
}
