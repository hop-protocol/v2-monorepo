import dotenv from 'dotenv'
dotenv.config()

export const pollIntervalSeconds = Number(process.env.POLL_INTERVAL_SECONDS ?? 10)
export const port = Number(process.env.PORT ?? 8000)
export const network = process.env.NETWORK ?? 'goerli'
export const rpcUrls: any = {
  ethereum: process.env.ETHEREUM_RPC,
  arbitrum: process.env.ARBITRUM_RPC,
  optimism: process.env.OPTIMISM_RPC,
  polygon: process.env.POLYGON_RPC,
  basezk: process.env.BASEZK_RPC,
  linea: process.env.LINEA_RPC
}
