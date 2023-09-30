import wait from 'wait'
import { Level } from 'level'
import { dbPath } from './config'

export class DbController {
  rootDb: any
  messageSentEventsTimestampDb: any
  syncStateDb: any
  ready: boolean

  constructor () {
    const rootDb = new Level(dbPath, { valueEncoding: 'json' })
    this.rootDb = rootDb

    const messageSentEventsTimestampDb = rootDb.sublevel('message-sent-events', { valueEncoding: 'json' })
    this.messageSentEventsTimestampDb = messageSentEventsTimestampDb

    const syncStateDb = rootDb.sublevel('sync-state')
    this.syncStateDb = syncStateDb

    this.init()
  }

  async init () {
    await this.rootDb.open()
    this.ready = true

    process.once('uncaughtException', async () => {
      this.rootDb.close()
      process.exit(0)
    })
  }

  protected async tilReady (): Promise<boolean> {
    if (this.ready) {
      return true
    }

    await wait(100)
    return await this.tilReady()
  }

  async putMessageSentEvent (input: any) {
    await this.tilReady()
    const { chainSlug, timestamp, blockNumber, messageId, from, toChainId, to, data } = input
    const key = `${chainSlug}-${timestamp}-${messageId}`
    await this.messageSentEventsTimestampDb.put(key, {
      chainSlug,
      timestamp,
      blockNumber,
      messageId,
      from,
      toChainId,
      to,
      data
    })
  }

  async getMessageSentEvents (): Promise<any> {
    await this.tilReady()
    const filter = {
      limit: 100
    }

    const items = await this.messageSentEventsTimestampDb.values(filter).all()
    return items
  }

  async getMessageSentEvent (messageId: string): Promise<any> {
    await this.tilReady()
    try {
      const key = `${messageId}`
      return await this.messageSentEventsTimestampDb.get(key)
    } catch (err: any) {
      if (err.notFound) {
        return null
      }
      throw err
    }
  }

  async getSyncState (key: string) {
    await this.tilReady()
    return this.syncStateDb.get(key)
  }

  async putSyncState (key: string, blockNumber: number) {
    await this.tilReady()
    await this.syncStateDb.put(key, blockNumber)
  }

  close () {
    this.rootDb.close()
  }
}
