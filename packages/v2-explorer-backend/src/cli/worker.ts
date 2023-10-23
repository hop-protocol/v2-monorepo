import { Worker } from '../worker'
import wait from 'wait'
import { actionHandler, parseBool, parseNumber, root } from './shared'

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
    '--indexer-poll-seconds <number>',
    'The number of seconds to wait between indexer polls',
    parseNumber
  )
  .action(actionHandler(main))

async function main (source: any) {
  const { dry: dryMode, server, indexerPollSeconds } = source

  console.log('starting worker')
  console.log('dryMode:', !!dryMode)
  console.log('server:', !!server)
  console.log('indexerPollSeconds:', indexerPollSeconds || 'default')

  if (server) {
    require('../server').server()
  }

  const worker = new Worker({
    indexerPollSeconds
  })
  await worker.start()
  while (true) {
    await wait(1000)
  }
}
