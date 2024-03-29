import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import { HDNode } from '@ethersproject/hdnode'
import { actionHandler, parseBool, parseString, root } from './shared'
import {
  defaultKeystoreFilePath
} from 'src/config'
import { generateKeystore, generateMnemonic, getKeystore, hdpath, recoverKeystore } from 'src/keystore'
import { promptConfirmMnemonic, promptPassphrase, promptRetryMnemonic, promptShowKeystore, promptShowMnemonic, promptShowReencryption } from 'src/prompt'

enum Actions {
  Generate = 'generate',
  Decrypt = 'decrypt',
  Reencrypt = 'reencrypt',
  Address = 'address'
}

export const keystoreProgram = root
  .command('keystore')
  .description('Keystore')
  .option('--skip-main [boolean]', 'Skip running main function (for testing).', parseBool)
  .option('--pass <secret>', 'Passphrase to encrypt keystore with.', parseString)
  .option('--newpass <secret>', 'Passphrase to reencrypt keystore with.', parseString)
  .option('--path <path>', 'File path of encrypted keystore.', parseString)
  .option('--override [boolean]', 'Override existing keystore if it exists.', parseBool)
  .option('--private-key <private-key>', 'The private key to encrypt.', parseString)
  .option('--skip-interactive-prompts', 'Skip interactive prompts (for testing).', parseBool)
  .action(actionHandler(main))

async function main (source: any) {
  let { override, args, pass: passphrase, newpass: newPassphrase, path: keystoreFilePath = defaultKeystoreFilePath, privateKey, skipInteractivePrompts } = source
  const action = args[0]
  const actionOptions = Object.values(Actions)

  if (!action) {
    throw new Error('please specify subcommand')
  }
  if (!actionOptions.includes(action)) {
    throw new Error(`please choose a valid option. valid options include ${actionOptions}.`)
  }
  if (!keystoreFilePath) {
    throw new Error('please specify keystore filepath')
  }

  if (action === Actions.Generate) {
    if (!passphrase) {
      passphrase = await generatePassphrase()
    }
    let mnemonic: string | undefined
    if (!privateKey) {
      mnemonic = generateMnemonic()
      let hdnode = HDNode.fromMnemonic(mnemonic)
      hdnode = hdnode.derivePath(hdpath)
      privateKey = hdnode.privateKey

      if (!skipInteractivePrompts) {
        await promptShowMnemonic(mnemonic)
      }
    }

    if (mnemonic) {
      let mnemonicConfirmed = false
      if (skipInteractivePrompts) {
        mnemonicConfirmed = true
      } else {
        while (!mnemonicConfirmed) {
          const mnemonicConfirm = await promptConfirmMnemonic()
          if (mnemonicConfirm === mnemonic) {
            mnemonicConfirmed = true
          } else {
            await promptRetryMnemonic()
          }
        }
      }
    }

    const keystore = await generateKeystore(privateKey, passphrase)
    const filepath = path.resolve(keystoreFilePath)
    const exists = fs.existsSync(filepath)
    if (exists) {
      if (!override) {
        throw new Error(
          'ERROR: file exists. Did not override. Use --override flag to override.'
        )
      }
    }
    fse.outputFileSync(filepath, JSON.stringify(keystore))
    if (skipInteractivePrompts) {
      console.log(`Public address: 0x${keystore.address}.\nYour keys can be found at: ${filepath}`)
    } else {
      await promptShowKeystore(keystore.address, filepath)
    }
  } else if (action === Actions.Decrypt) {
    if (!passphrase) {
      passphrase = await promptPassphrase()
    }
    const keystore = getKeystore(keystoreFilePath)
    const recoveredPrivateKey = await recoverKeystore(keystore, passphrase)
    console.log(recoveredPrivateKey) // intentional log because it's purpose of this command
  } else if (action === Actions.Reencrypt) {
    if (!passphrase) {
      passphrase = await promptPassphrase()
    }
    const oldPassphrase = passphrase
    let keystore = getKeystore(keystoreFilePath)
    const recoveredPrivateKey = await recoverKeystore(keystore, oldPassphrase)

    if (!passphrase) {
      newPassphrase = await generatePassphrase()
    }
    keystore = await generateKeystore(recoveredPrivateKey, newPassphrase)
    fse.outputFileSync(keystoreFilePath, JSON.stringify(keystore))
    await promptShowReencryption(keystore.address, keystoreFilePath)
  } else if (action === Actions.Address) {
    const keystore = getKeystore(keystoreFilePath)
    const address = keystore.address
    console.log(`0x${address}`) // intentional log because it's purpose of this command
  }
}

async function generatePassphrase (): Promise<string> {
  const passphrase = await promptPassphrase(
    'Enter new keystore encryption passphrase'
  )
  const passphraseConfirm = await promptPassphrase('Confirm passphrase')
  if (passphrase !== passphraseConfirm) {
    throw new Error('ERROR: passphrases did not match')
  }

  return (passphrase)
}
