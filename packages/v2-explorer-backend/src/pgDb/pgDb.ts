import pgp from 'pg-promise'
import { postgresConfig } from '../config'
import { BundleCommitted } from './events/BundleCommitted'
import { BundleForwarded } from './events/BundleForwarded'
import { BundleSet } from './events/BundleSet'
import { FeesSentToHub } from './events/FeesSentToHub'
import { MessageBundled } from './events/MessageBundled'
import { MessageExecuted } from './events/MessageExecuted'
import { MessageSent } from './events/MessageSent'
import {BundleReceived} from './events/BundleReceived'

const argv = require('minimist')(process.argv.slice(2))

export class DbController {
  db: any
  events: any = {}

  constructor () {
    const initOptions: any = {}
    const maxConnections = postgresConfig.maxConnections
    const opts = {
      max: maxConnections
    }

    const db = pgp(initOptions)({ ...postgresConfig, ...opts })
    this.db = db
    this.init().catch(console.error).then(() => {
      console.log('db init done')
    })

    this.events = {
      BundleCommitted: new BundleCommitted(this.db),
      BundleForwarded: new BundleForwarded(this.db),
      BundleReceived: new BundleReceived(this.db),
      BundleSet: new BundleSet(this.db),
      FeesSentToHub: new FeesSentToHub(this.db),
      MessageBundled: new MessageBundled(this.db),
      MessageExecuted: new MessageExecuted(this.db),
      MessageSent: new MessageSent(this.db),
    }
  }

  async init () {
    const resetDb = argv.reset
    if (resetDb) {
      await this.db.query('DROP TABLE IF EXISTS events')
    }

    const migration = argv.migration
    if (migration) {
      // await this.db.query(`
      //   ALTER TABLE events ADD COLUMN IF NOT EXISTS test BOOLEAN
      // `)
    }

    for (const event in this.events) {
      await this.events[event].createTable()
      await this.events[event].createIndexes()
    }
  }

  async getMessageSentEvents (opts: any = {}) {
    return this.events.MessageSent.getItems(opts)
  }

  async upsertMessageSentEvents (item: any) {
    return this.events.MessageSent.upsertItem(item)
  }
}
