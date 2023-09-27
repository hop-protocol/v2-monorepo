import request from 'supertest'
import { app } from '../src/server'

describe('Server', () => {
  it('gas-price', async () => {
    const timestamp = 1695439134
    const res = await request(app).get(`/v1/gas-price?chain=optimism&timestamp=${timestamp}`).send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
  }, 60 * 1000)
  it('gas-price-valid', async () => {
    const timestamp = 1695439134
    const gasPrice = '50'
    const res = await request(app).get(`/v1/gas-price-valid?chain=optimism&timestamp=${timestamp}&gasPrice=${gasPrice}`).send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
  }, 60 * 1000)
  it('gas-cost-estimate', async () => {
    const timestamp = 1695439134
    const gasLimit = 21000
    const txData = '0x01de8001328252089400000000000000000000000000000000000000008080c0'
    const res = await request(app).get(`/v1/gas-cost-estimate?chain=optimism&timestamp=${timestamp}&gasLimit=${gasLimit}&txData=${txData}`).send()
    console.log(res.body)
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
  }, 60 * 1000)
})
