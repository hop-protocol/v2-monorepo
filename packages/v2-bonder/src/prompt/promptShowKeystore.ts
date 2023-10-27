import clearConsole from 'console-clear'
import { prompt } from './prompt'

export async function promptShowKeystore (
  keystoreAddress: string,
  filepath: string
) {
  clearConsole()
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ':'
  await prompt.get({
    properties: {
      blank: {
        message: `
Creating your keys
Creating your keystore
Public address: 0x${keystoreAddress}
Your keys can be found at: ${filepath}

Keystore generation is complete.
Press [Enter] to exit.
`
      }
    }
  } as any)
  clearConsole()
}
