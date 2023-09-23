import dotenv from 'dotenv'

import { TextDecoder, TextEncoder } from 'util'
dotenv.config()
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

export const pollIntervalSeconds = Number(process.env.POLL_INTERVAL_SECONDS ?? 10)
export const port = Number(process.env.PORT ?? 8000)
export const network = process.env.NETWORK ?? 'goerli'
export const rpcUrls: any = {
  ethereum: process.env.ETHEREUM_RPC,
  arbitrum: process.env.ARBITRUM_RPC,
  optimism: process.env.OPTIMISM_RPC,
  polygon: process.env.POLYGON_RPC,
  base: process.env.BASE_RPC,
  linea: process.env.LINEA_RPC
}
export const dbPath = process.env.DB_PATH ?? './mydb'
