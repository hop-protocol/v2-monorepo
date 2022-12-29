import { Controller } from '../src/controller'

describe('Controller', () => {
  it('should get events', async () => {
    const controller = new Controller()
    const limit = 10
    let { lastKey, items } = await controller.getMessageSentEvents(limit)
    // console.log(items)
    let timestamps = items.map((item: any) => item.context.blockTimestamp)
    console.log(JSON.stringify(timestamps, null, 2))
    expect(items.length).toBe(limit)
    expect(timestamps).toStrictEqual(timestamps.slice(0).sort((a: any, b: any) => b - a))

    ;({ lastKey, items } = await controller.getMessageSentEvents(limit, lastKey))
    timestamps = items.map((item: any) => item.context.blockTimestamp)
    console.log(JSON.stringify(timestamps, null, 2))
    expect(timestamps).toStrictEqual(timestamps.slice(0).sort((a: any, b: any) => b - a))
    expect(items.length).toBe(limit)
  }, 10 * 60 * 1000)
})
