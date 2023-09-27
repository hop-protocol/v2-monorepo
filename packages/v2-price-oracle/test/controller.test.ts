import { Controller } from '../src/controller'

describe('Controller', () => {
  const controller = new Controller()
  it('getFeeData', async () => {
    const item = await controller.getFeeData({ chainSlug: 'optimism', timestamp: Math.floor(Date.now() / 1000) })
    console.log(item)
    expect(item).toBeTruthy()
  }, 60 * 1000)
  it('getGasPriceValid - true', async () => {
    const controller = new Controller()
    const result = await controller.getGasPriceValid({ chainSlug: 'optimism', timestamp: 1695439139, gasPrice: '50' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.valid).toBeTruthy()
  }, 60 * 1000)
  it('getGasPriceValid - false', async () => {
    const controller = new Controller()
    const result = await controller.getGasPriceValid({ chainSlug: 'optimism', timestamp: 1695439139, gasPrice: '49' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.valid).toBeFalsy()
  }, 60 * 1000)
  it('calcGasCost - ethereum', async () => {
    const controller = new Controller()
    const result = await controller.calcGasCost({ chainSlug: 'ethereum', timestamp: 1695439139, gasLimit: '21000' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.gasCost).toBe('0.000147')
  }, 60 * 1000)
  it.only('calcGasCost - optimism', async () => {
    const controller = new Controller()
    const txData = ''
    const result = await controller.calcGasCost({ chainSlug: 'optimism', timestamp: 1695772800, gasLimit: '21000', txData })
    console.log(result)
    expect(result).toBeTruthy()
  }, 60 * 1000)
  afterAll(() => {
    controller.close()
  })
})
