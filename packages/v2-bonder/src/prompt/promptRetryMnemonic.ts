import clearConsole from 'console-clear'
import { prompt } from './prompt'

export async function promptRetryMnemonic () {
  clearConsole()
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ':'
  await prompt.get({
    properties: {
      blank: {
        message: `
The seed phrase you entered was incorrect.

Press [Enter] to try again.`
      }
    }
  } as any)
  clearConsole()
}
