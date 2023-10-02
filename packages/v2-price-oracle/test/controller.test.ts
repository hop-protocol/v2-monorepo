import { Controller } from '../src/controller'

describe('Controller', () => {
  const controller = new Controller()
  it('getGasFeeData', async () => {
    const item = await controller.getGasFeeData({ chainSlug: 'optimism', timestamp: 1695956264 })
    console.log(item)
    expect(item).toBeTruthy()
  }, 60 * 1000)
  it('getGasPriceVerify - true', async () => {
    const controller = new Controller()
    const result = await controller.getGasPriceVerify({ chainSlug: 'optimism', timestamp: 1695439139, gasPrice: '50' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.valid).toBeTruthy()
  }, 60 * 1000)
  it('getGasPriceVerify - false', async () => {
    const controller = new Controller()
    const result = await controller.getGasPriceVerify({ chainSlug: 'optimism', timestamp: 1695439139, gasPrice: '49' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.valid).toBeFalsy()
  }, 60 * 1000)
  it('getGasCostEstimate - ethereum', async () => {
    const controller = new Controller()
    const result = await controller.getGasCostEstimate({ chainSlug: 'ethereum', timestamp: 1695439139, gasLimit: '21000' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.gasCost).toBe('0.000000000000147')
  }, 60 * 1000)
  it('getGasCostEstimate - optimism', async () => {
    const controller = new Controller()
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const result = await controller.getGasCostEstimate({ chainSlug: 'optimism', timestamp: 1695772800, gasLimit: '21000', txData })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.gasCost).toBe('0.000000000000089952')
  }, 60 * 1000)
  it('getGasCostEstimate - arbitrum', async () => {
    const controller = new Controller()
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const result = await controller.getGasCostEstimate({ chainSlug: 'arbitrum', timestamp: 1695772800, txData })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.gasCost).toBe('0.0000267173')
  }, 60 * 1000)
  it.only('getGasCostVerify - optimism', async () => {
    const controller = new Controller()
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const result = await controller.gasCostVerify({ chainSlug: 'optimism', timestamp: 1695772800, gasLimit: '21000', txData, targetGasCost: '0.000000000000089952' })
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.valid).toBeTruthy()
  }, 60 * 1000)
  afterAll(() => {
    controller.close()
  })
})
