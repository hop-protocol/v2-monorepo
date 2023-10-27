import clearConsole from 'console-clear'
import { prompt } from './prompt'

export async function promptShowMnemonic (
  mnemonic: string
) {
  clearConsole()
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ''
  await prompt.get({
    properties: {
      blank: {
        message: `
This is your seed phrase. Write it down and store it safely.

${mnemonic}

Press [Enter] when you have written down your mnemonic.`
      }
    }
  } as any)
  clearConsole()
}
