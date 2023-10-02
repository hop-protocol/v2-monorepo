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
  it.only('gas-cost-estimate - optimism2', async () => {
    const timestamp = 1696283252
    const gasLimit = 50994
    const txData = '0x723a177900000000000000000000000077c4335bc35abaec784613ad55e9c11399d0222600000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000010a56f823ba000000000000000000000000000000000000000000000000000000000000003b6261666b7265696232616d73697a653372757a70676970757968717a366668677a366d676f7369763578727a78766164666c626268617a357463650000000000'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}`).send()
    const { data } = res.body
    console.log(data)
    console.log(JSON.stringify(res.body, null, 2))
    expect(data).toBeTruthy()
    // expect(data.gasCost).toBe('0.00007649100260742') // etherscan value
    expect(data.gasCost).toBe('0.00007649100260338')
  }, 10 * 60 * 1000)
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
