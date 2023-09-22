import { Controller } from '../controller'
import { OsStats } from '../OsStats'
import { actionHandler, parseNumber, root } from './shared'
import { server } from '../server'

const controller = new Controller()

export const workerProgram = root
  .command('worker')
  .option('--sync-start-timestamp <timestamp>', 'Sync start timestamp', parseNumber)
  .description('Start the worker')
  .action(actionHandler(main))

async function main (source: any) {
  console.log('starting worker')

  const osStats = new OsStats()

  await Promise.all([
    controller.startPoller({
      syncStartTimestamp: source.syncStartTimestamp
    }),
    osStats.start(),
    server()
  ])
}
