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
})
