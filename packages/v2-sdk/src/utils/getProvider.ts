import { goerliNetworks, mainnetNetworks } from '@hop-protocol/v2-core/networks'
import { providers } from 'ethers'

export function getProvider (network: string, chain: string) {
  if (network === 'goerli') {
    return new providers.JsonRpcProvider((goerliNetworks as any)[chain].publicRpcUrl)
  } else if (network === 'mainnet') {
    return new providers.JsonRpcProvider((mainnetNetworks as any)[chain].publicRpcUrl)
  }
  throw new Error(`Invalid network: ${network}`)
}
