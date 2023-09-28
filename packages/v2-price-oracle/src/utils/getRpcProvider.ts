import { providers } from 'ethers'
import { rpcUrls } from '../config'
import { FallbackProvider } from '@hop-protocol/sdk'

export function getRpcProvider (chain: string): providers.Provider {
  const urls = rpcUrls[chain]
  return FallbackProvider.fromUrls(urls)
}
