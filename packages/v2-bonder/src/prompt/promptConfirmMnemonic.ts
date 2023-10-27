import clearConsole from 'console-clear'
import { prompt } from './prompt'

export async function promptConfirmMnemonic () {
  clearConsole()
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ':'
  const { mnemonicConfirm } = await prompt.get({
    properties: {
      mnemonicConfirm: {
        message:
          'Please type mnemonic (separated by spaces) to confirm you have written it down\n\n:'
      }
    }
  } as any)
  clearConsole()

  return (mnemonicConfirm as string).trim()
}
