import cors from 'cors'
import express from 'express'
import { Controller } from './controller'
import { port } from './config'

export const app = express()

app.enable('trust proxy')
app.use(cors())
app.use(express.json({ limit: '500kb' }))
app.use(express.urlencoded({ extended: false, limit: '500kb', parameterLimit: 50 }))

const controller = new Controller()

app.get('/', (req: any, res: any) => {
  try {
    res.status(200).json({ status: 'ok' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/', async (req: any, res: any) => {
  try {
    res.status(200).json({})
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/v1/quote', async (req: any, res: any) => {
  try {
    const chainSlug = req.query.chain
    if (!chainSlug) {
      throw new Error('chainSlug required')
    }
    const data = await controller.getQuote({ chainSlug })
    res.status(200).json({ status: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok' })
})

export function server () {
  const host = '0.0.0.0'
  app.listen(port, host, () => {
    console.log(`Listening on port ${port}`)
  })
}
