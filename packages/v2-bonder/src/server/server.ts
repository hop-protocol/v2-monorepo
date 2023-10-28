import cors from 'cors'
import express from 'express'
import { ipRateLimitMiddleware } from './rateLimit'
import { port } from '../config'

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

const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log(`Listening on port ${port}`)
})
