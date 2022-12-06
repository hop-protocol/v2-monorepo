import { Worker } from '../worker'
import { actionHandler, parseBool, root } from './shared'

root
  .command('worker')
  .description('Start the worker')
  .option(
    '--dry [boolean]',
    'Start in dry mode. If enabled, no transactions will be sent.',
    parseBool
  )
  .action(actionHandler(main))

async function main (source: any) {
  const { dry: dryMode } = source

  console.log('starting worker')
  console.log('dryMode:', !!dryMode)

  const worker = new Worker()
  await worker.start()
}
