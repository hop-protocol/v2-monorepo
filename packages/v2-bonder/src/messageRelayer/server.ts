import { Controller } from './controller'

const controller = new Controller()

export function setServerRoutes (app: any) {
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
}
