import dotenv from 'dotenv'

import { TextDecoder, TextEncoder } from 'util'
dotenv.config()
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

export const pollIntervalSeconds = Number(process.env.POLL_INTERVAL_SECONDS ?? 10)
export const port = Number(process.env.PORT ?? 8000)
export const network = process.env.NETWORK ?? 'goerli'
const chains = ['ethereum', 'optimism', 'arbitrum', 'base']

export const rpcUrls: any = {}

for (const chain of chains) {
  const urls = process.env[`${chain.toUpperCase()}_RPC`]?.split(',').map((url: string) => url.trim()).filter(Boolean)
  if (urls) {
    rpcUrls[chain] = urls
  }
}

export const dbPath = process.env.DB_PATH ?? './mydb'

export const bridgeAddresses: any = {
  ethereum: '',
  optimism: '',
  arbitrum: '',
  base: ''
}
