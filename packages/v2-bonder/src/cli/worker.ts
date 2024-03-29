import fs from 'fs'
import { OsStats } from '../osStats'
import { Worker } from '../worker'
import { actionHandler, parseBool, parseNumber, root } from './shared'
import {
  defaultKeystoreFilePath
} from 'src/config'
import { getKeystore, recoverKeystore } from 'src/keystore'
import { promptPassphrase } from 'src/prompt'
import { setSignerUsingPrivateKey } from 'src/signer'

export const workerProgram = root
  .command('worker')
  .description('Start the worker')
  .option('--skip-main [boolean]', 'Skip running main function (for testing).', parseBool)
  .option(
    '--dry [boolean]',
    'Start in dry mode. If enabled, no transactions will be sent.',
    parseBool
  )
  .option(
    '--server [boolean]',
    'Start the api server',
    parseBool
  )
  .option(
    '--message-relayer [boolean]',
    'Start message relayer',
    parseBool
  )
  .option(
    '--indexer-poll-seconds <number>',
    'The number of seconds to wait between indexer polls',
    parseNumber
  )
  .option(
    '--exit-bundle-poll-seconds <number>',
    'The number of seconds to wait between exit bundle polls',
    parseNumber
  )
  .option(
    '--exit-bundle-retry-delay-seconds <number>',
    'The number of seconds to wait between exit bundle retries',
    parseNumber
  )
  .option(
    '--demo-relayer [boolean]',
    'Run the demo exit relayer',
    parseNumber
  )
  .action(actionHandler(main))

async function main (source: any) {
  const { dry: dryMode, server, indexerPollSeconds, exitBundlePollSeconds, exitBundleRetryDelaySeconds, demoRelayer, messageRelayer } = source
  const keystoreFilePath = defaultKeystoreFilePath

  console.log('starting worker')
  console.log('dryMode:', !!dryMode)
  console.log('server:', !!server)
  console.log('indexerPollSeconds:', indexerPollSeconds || 'default')
  console.log('exitBundlePollSeconds:', exitBundlePollSeconds || 'default')
  console.log('exitBundleRetryDelaySeconds:', exitBundleRetryDelaySeconds || 'default')
  console.log('demoRelayer:', !!demoRelayer)
  console.log('messageRelayer:', !!messageRelayer)

  const exists = fs.existsSync(keystoreFilePath)
  if (exists) {
    const passphrase = await promptPassphrase()
    const keystore = getKeystore(keystoreFilePath)
    const recoveredPrivateKey = await recoverKeystore(keystore, passphrase)
    setSignerUsingPrivateKey(recoveredPrivateKey)
  }

  if (server) {
    require('../server')
  }

  if (demoRelayer) {
    require('../demoRelayer')
  }

  const osStats = new OsStats()

  const worker = new Worker({
    indexerPollSeconds,
    exitBundlePollSeconds,
    exitBundleRetryDelaySeconds
  })
  await Promise.all([
    osStats.start(),
    worker.start({
      messageRelayer
    })
  ])
}
