import request from 'supertest'
import { app } from '../src/server'

describe('Server', () => {
  it('health', async () => {
    const res = await request(app).get('/health').send()
    expect(res.body).toBeTruthy()
    expect(res.body.status).toBe('ok')
  }, 60 * 1000)
  it('quote', async () => {
    const res = await request(app).get('/v1/quote?chain=optimism').send()
    const { data } = res.body
    console.log(data)
    expect(data).toBeTruthy()
  }, 60 * 1000)
})
