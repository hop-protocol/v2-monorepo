import '../moduleAlias'
import packageJson from '../../package.json'
import { program } from './shared'

import './bond'
import './keystore'
import './nftWorker'
import './sendTransfer'
import './stake'
import './unstake'
import './worker'

program.version(packageJson.version)
program.parse(process.argv)

process.on('SIGINT', () => {
  console.debug('received SIGINT signal. exiting.')
  process.exit(0)
})

process.on('unhandledRejection', (reason: Error, p: Promise<any>) => {
  console.error('unhandled rejection: promise:', p, 'reason:', reason)
})
