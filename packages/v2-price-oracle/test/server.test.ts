import request from 'supertest'
import { app } from '../src/server'

describe('Server', () => {
  it('gas-fee-data', async () => {
    const timestamp = 1695439134
    const res = await request(app).get(`/v1/gas-fee-data?chain=optimism&timestamp=${timestamp}`).send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.feeData.baseFeePerGas).toBe('50')
    expect(data.feeData.l1BaseFee).toBe('7')
  }, 60 * 1000)
  it('gas-cost-estimate - ethereum', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=ethereum&timestamp=${timestamp}&gasLimit=${gasLimit}`).send()
    console.log(res.body)
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.gasCost).toBe('0.000000000000147')
  }, 60 * 1000)
  it('gas-cost-estimate - optimism', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}`).send()
    const { data } = res.body
    console.log(data)
    console.log(JSON.stringify(res.body, null, 2))
    expect(data).toBeTruthy()
    expect(data.l1Fee).toBe('0.000000000000026236')
    expect(data.l2Fee).toBe('0.00000000210105')
    expect(data.gasCost).toBe('0.000000000000052472')
  }, 60 * 1000)
  it('gas-cost-estimate - arbitrum', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=arbitrum&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}`).send()
    console.log(res.body)
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.gasCost).toBe('0.0000169421')
  }, 60 * 1000)
  it('gas-cost-estimate-verify', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const targetGasCost = '0.000000000000052472'
    const res = await request(app).get(`/v1/gas-cost-estimate-verify?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}&targetGasCost=${targetGasCost}`).send()
    const { data } = res.body
    console.log(JSON.stringify(res.body, null, 2))
    console.log(data)
    expect(data).toBeTruthy()
    expect(data.valid).toBeTruthy()
  }, 60 * 1000)
})
