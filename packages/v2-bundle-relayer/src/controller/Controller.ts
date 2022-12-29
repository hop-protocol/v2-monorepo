import { db } from '../db'

type EventsResult = {
  lastKey: string
  items: any[]
}

export class Controller {
  async getEvents (eventsDb: any, limit: number = 10, lastKey: string = '~'): Promise<EventsResult> {
    const filter = {
      gt: '',
      lte: lastKey,
      reverse: true,
      limit: limit
    }
    let items: any[] = await eventsDb.timestampDb._getKeyValues(filter)
    items = items.filter((item: any) => !!item.key)
    const ids = items.map((item: any) => item.value.id)
    lastKey = items.length > 0 ? items[items.length - 1].key : null
    items = await eventsDb.getEventsFromIds(ids)

    return {
      lastKey,
      items
    }
  }

  async getMessageSentEvents (limit: number = 10, lastKey: string = '~'): Promise<EventsResult> {
    return this.getEvents(db.messageSentEventsDb, limit, lastKey)
  }
}
