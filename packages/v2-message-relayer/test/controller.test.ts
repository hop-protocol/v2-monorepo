import { Controller } from '../src/controller'

describe('Controller', () => {
  const controller = new Controller()
  it('getQuote', async () => {
    const item = await controller.getQuote({ chainSlug: 'optimism' })
    console.log(item)
    expect(item).toBeTruthy()
  }, 60 * 1000)
  afterAll(() => {
    controller.close()
  })
})
