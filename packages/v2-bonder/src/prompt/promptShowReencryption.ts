export async function promptShowReencryption (keystoreAddress: string, filepath: string) {
  console.log(`
Public address: 0x${keystoreAddress}
Your keys can be found at: ${filepath}

Keystore reencryption is complete.
`
  )
}
