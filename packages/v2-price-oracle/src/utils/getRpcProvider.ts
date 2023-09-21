import { providers } from 'ethers'
import { rpcUrls } from '../config'

export function getRpcProvider (chain: string) {
  const url = rpcUrls[chain]
  return new providers.StaticJsonRpcProvider(url)
}
