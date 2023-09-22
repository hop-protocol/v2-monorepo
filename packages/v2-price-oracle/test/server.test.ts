import request from 'supertest'
import { app } from '../src/server'

describe('Server', () => {
  it('gas-price', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const res = await request(app).get(`/v1/gas-price?chain=arbitrum&timestamp=${timestamp}`).send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
  }, 60 * 1000)
})
