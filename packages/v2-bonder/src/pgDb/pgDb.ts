import minimist from 'minimist'
import pgp from 'pg-promise'
import { BundleCommitted } from './events/messenger/BundleCommitted'
import { BundleForwarded } from './events/messenger/BundleForwarded'
import { BundleReceived } from './events/messenger/BundleReceived'
import { BundleSet } from './events/messenger/BundleSet'
import { FeesSentToHub } from './events/messenger/FeesSentToHub'
import { MessageBundled } from './events/messenger/MessageBundled'
import { MessageExecuted } from './events/messenger/MessageExecuted'
import { MessageSent } from './events/messenger/MessageSent'
import { NftConfirmationSent } from './events/nft/ConfirmationSent'
import { NftTokenConfirmed } from './events/nft/TokenConfirmed'
import { NftTokenSent } from './events/nft/TokenSent'
import { TransferBonded } from './events/liquidityHub/TransferBonded'
import { TransferSent } from './events/liquidityHub/TransferSent'
import { postgresConfig } from '../config'

const argv = minimist(process.argv.slice(2))

export class PgDb {
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

    this.events = {
      BundleCommitted: new BundleCommitted(this.db),
      BundleForwarded: new BundleForwarded(this.db),
      BundleReceived: new BundleReceived(this.db),
      BundleSet: new BundleSet(this.db),
      FeesSentToHub: new FeesSentToHub(this.db),
      MessageBundled: new MessageBundled(this.db),
      MessageExecuted: new MessageExecuted(this.db),
      MessageSent: new MessageSent(this.db),

      TransferBonded: new TransferBonded(this.db),
      TransferSent: new TransferSent(this.db),

      ConfirmationSent: new NftConfirmationSent(this.db),
      TokenConfirmed: new NftTokenConfirmed(this.db),
      TokenSent: new NftTokenSent(this.db)
    }

    this.init().catch((err: any) => {
      console.error('pg db error', err)
      process.exit(1)
    }).then(() => {
      console.log('pg db init done')
    })
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
}

export const pgDb = new PgDb()
