import fs from 'fs'
import { Worker } from '../nft/worker'
import { actionHandler, parseBool, parseNumber, root } from './shared'
import {
  defaultKeystoreFilePath
} from 'src/config'
import { getKeystore, recoverKeystore } from 'src/keystore'
import { promptPassphrase } from 'src/prompt'
import { setSignerUsingPrivateKey } from 'src/signer'

export const workerProgram = root
  .command('nft-worker')
  .description('Start the NFT relayer worker')
  .option('--skip-main [boolean]', 'Skip running main function (for testing).', parseBool)
  .option(
    '--dry [boolean]',
    'Start in dry mode. If enabled, no transactions will be sent.',
    parseBool
  )
  .option(
    '--indexer-poll-seconds <number>',
    'The number of seconds to wait between indexer polls',
    parseNumber
  )
  .action(actionHandler(main))

async function main (source: any) {
  const { dry: dryMode, server, indexerPollSeconds } = source
  const keystoreFilePath = defaultKeystoreFilePath

  console.log('starting worker')
  console.log('dryMode:', !!dryMode)
  console.log('server:', !!server)
  console.log('indexerPollSeconds:', indexerPollSeconds || 'default')

  const exists = fs.existsSync(keystoreFilePath)
  if (exists) {
    const passphrase = await promptPassphrase()
    const keystore = getKeystore(keystoreFilePath)
    const recoveredPrivateKey = await recoverKeystore(keystore, passphrase)
    setSignerUsingPrivateKey(recoveredPrivateKey)
  }

  const worker = new Worker({
    indexerPollSeconds
  })
  await worker.start()
}
