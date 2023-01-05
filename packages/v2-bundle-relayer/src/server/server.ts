import cors from 'cors'
import express from 'express'
import { Controller } from '../controller'
import { ipRateLimitMiddleware } from './rateLimit'
import { port } from '../config'
import { responseCache } from './responseCache'

const app = express()

app.enable('trust proxy')
app.use(cors())
app.use(express.json({ limit: '500kb' }))
app.use(express.urlencoded({ extended: false, limit: '500kb', parameterLimit: 50 }))
app.use(ipRateLimitMiddleware)

app.get('/', (req: any, res: any) => {
  res.status(404).json({ error: 'not found' })
})

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok' })
})

app.get('/v1/events', responseCache, async (req: any, res: any) => {
  try {
    let { eventName, firstKey, lastKey, limit = 10, filter } = req.query
    if (!eventName) {
      throw new Error('missing eventName')
    }
    limit = Number(limit)
    if (limit < 1) {
      throw new Error('limit must be greater than 0')
    }
    if (limit > 10) {
      throw new Error('limit must be less than 10')
    }
    const controller = new Controller()
    const { lastKey: newLastKey, firstKey: newFirstKey, items } = await controller.getEventsForApi({
      eventName,
      limit,
      lastKey,
      firstKey,
      filter
    })
    res.status(200).json({
      events: items,
      lastKey: newLastKey,
      firstKey: newFirstKey
    })
  } catch (err: any) {
    console.error(err)
    res.json({ error: err.message })
  }
})

const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`)
})
