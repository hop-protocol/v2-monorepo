import { prompt } from './prompt'

export async function promptPassphrase (
  message: string = 'keystore passphrase'
) {
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ':'
  const { passphrase } = await prompt.get({
    properties: {
      passphrase: {
        message,
        hidden: true
      }
    }
  } as any)
  return passphrase
}
