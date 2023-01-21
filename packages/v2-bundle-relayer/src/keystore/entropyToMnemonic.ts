import * as bip39 from 'bip39'

export function entropyToMnemonic (entropy: Buffer): string {
  return bip39.entropyToMnemonic(entropy)
}
