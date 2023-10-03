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

app.get('/v1/gas-fee-data', async (req: any, res: any) => {
  try {
    const chainSlug = req.query.chain
    const timestamp = Number(req.query.timestamp) || Math.floor(Date.now() / 1000)
    if (!chainSlug) {
      throw new Error('chainSlug required')
    }
    if (!timestamp) {
      throw new Error('timestamp required')
    }
    const data = await controller.getGasFeeData({ chainSlug, timestamp })
    res.status(200).json({ status: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/v1/gas-price-verify', async (req: any, res: any) => {
  try {
    const chainSlug = req.query.chain
    const timestamp = Number(req.query.timestamp)
    const gasPrice = req.query.gasPrice
    if (!chainSlug) {
      throw new Error('chainSlug required')
    }
    if (!timestamp) {
      throw new Error('timestamp required')
    }
    if (!gasPrice) {
      throw new Error('gasPrice is required')
    }
    const data = await controller.getGasPriceVerify({ chainSlug, timestamp, gasPrice })
    res.status(200).json({ status: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/v1/gas-cost-estimate', async (req: any, res: any) => {
  try {
    const chainSlug = req.query.chain
    let timestamp: any = Number(req.query.timestamp) || Math.floor(Date.now() / 1000)
    const blockNumber = Number(req.query.blockNumber)
    const gasLimit = req.query.gasLimit
    const txData = req.query.txData
    const destinationAddress = req.query.destinationAddress
    const from = req.query.from
    if (blockNumber > 0) {
      timestamp = undefined
    }
    if (!chainSlug) {
      throw new Error('chainSlug required')
    }
    if (timestamp && blockNumber) {
      throw new Error('cannot specify both timestamp and blockNumber')
    }
    if (!timestamp && !blockNumber) {
      throw new Error('must specify either timestamp or blockNumber')
    }
    const data = await controller.getGasCostEstimate({ chainSlug, timestamp, blockNumber, gasLimit, txData, from, destinationAddress })
    res.status(200).json({ status: 'ok', data })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/v1/gas-cost-estimate-verify', async (req: any, res: any) => {
  try {
    const chainSlug = req.query.chain
    const timestamp = Number(req.query.timestamp)
    const blockNumber = Number(req.query.blockNumber)
    const gasLimit = req.query.gasLimit
    const txData = req.query.txData
    const targetGasCost = req.query.targetGasCost
    const destinationAddress = req.query.destinationAddress
    const from = req.query.from
    if (!chainSlug) {
      throw new Error('chainSlug required')
    }
    if (timestamp && blockNumber) {
      throw new Error('cannot specify both timestamp and blockNumber')
    }
    if (!timestamp && !blockNumber) {
      throw new Error('must specify either timestamp or blockNumber')
    }
    if (!targetGasCost) {
      throw new Error('targetGasCost is required')
    }
    const data = await controller.gasCostVerify({ chainSlug, timestamp, gasLimit, txData, targetGasCost, destinationAddress, from })
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
