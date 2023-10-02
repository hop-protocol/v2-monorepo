import { FallbackProvider } from '@hop-protocol/sdk'
import { providers } from 'ethers'
import { rpcUrls } from '../config'

export function getRpcProvider (chain: string): providers.Provider {
  const urls = rpcUrls[chain]
  return FallbackProvider.fromUrls(urls)
}
