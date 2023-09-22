import { Controller } from '../src/controller'

describe('Controller', () => {
  it('controller', async () => {
    const controller = new Controller()
    const item = await controller.getFeeData({ chainSlug: 'ethereum', timestamp: Math.floor(Date.now() / 1000) })
    // const item = await controller.dbController.getGasFeeDataItems()
    console.log(item)
    expect(item).toBeTruthy()
    controller.close()
  }, 60 * 1000)
})
