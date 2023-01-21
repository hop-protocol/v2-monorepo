import { entropyToMnemonic } from './entropyToMnemonic'
import { randomBytes } from 'crypto'

export function generateMnemonic (): string {
  const entropy = randomBytes(32)
  return entropyToMnemonic(entropy)
}
