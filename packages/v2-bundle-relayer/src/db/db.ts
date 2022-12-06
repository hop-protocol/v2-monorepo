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
  getBundleCommittedEventsDb () {
    return getDb(BundleCommittedEventsDb)
  },
  getBundleForwardedEventsDb () {
    return getDb(BundleForwardedEventsDb)
  },
  getBundleReceivedEventsDb () {
    return getDb(BundleReceivedEventsDb)
  },
  getBundleSetEventsDb () {
    return getDb(BundleSetEventsDb)
  },
  getFeesSentToHubEventsDb () {
    return getDb(FeesSentToHubEventsDb)
  },
  getMessageBundledEventsDb () {
    return getDb(MessageBundledEventsDb)
  },
  getMessageSentEventsDb () {
    return getDb(MessageSentEventsDb)
  },
  getMessageRelayedEventsDb () {
    return getDb(MessageRelayedEventsDb)
  },
  getMessageRevertedEventsDb () {
    return getDb(MessageRevertedEventsDb)
  }
}
