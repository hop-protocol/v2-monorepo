import { Controller } from '../controller'
import { OsStats } from '../OsStats'
import { actionHandler, parseString, root } from './shared'
import { server } from '../server'
import { DateTime } from 'luxon'

const controller = new Controller()

export const workerProgram = root
  .command('worker')
  .option('--sync-start-timestamp <timestamp>', 'Sync start timestamp', parseString)
  .description('Start the worker')
  .action(actionHandler(main))

async function main (source: any) {
  console.log('starting worker')

  const osStats = new OsStats()

  let syncStartTimestamp = source.syncStartTimestamp
  if (syncStartTimestamp === 'now') {
    syncStartTimestamp = Math.floor(DateTime.now().toUTC().toSeconds())
  }

  await Promise.all([
    controller.startPoller({
      syncStartTimestamp: syncStartTimestamp ? Number(syncStartTimestamp) : undefined
    }),
    osStats.start(),
    server()
  ])
}
