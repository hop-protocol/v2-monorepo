import { keystoreProgram } from 'src/cli/keystore'
import { workerProgram } from 'src/cli/worker'

describe('cli', () => {
  it('worker - should correctly parse options', async () => {
    workerProgram.parse([
      'node',
      './bin/relayer',
      '--dry',
      '--server',
      '--indexer-poll-seconds',
      '10',
      '--exit-bundle-poll-seconds',
      '20',
      '--exit-bundle-retry-delay-seconds',
      '60'
    ])

    const opts = workerProgram.opts()
    console.log('opts', opts)

    expect(opts.dry).toBe(true)
    expect(opts.server).toBe(true)
    expect(opts.indexerPollSeconds).toBe(10)
    expect(opts.exitBundlePollSeconds).toBe(20)
    expect(opts.exitBundleRetryDelaySeconds).toBe(60)
  })
  it('keystore - should correctly parse options', async () => {
    keystoreProgram.parse([
      'node',
      './bin/relayer',
      '--pass',
      'somesecret',
      '--path',
      '/tmp/keystore',
      '--override',
      '--private-key',
      '0x123'
    ])

    const opts = keystoreProgram.opts()
    console.log('opts', opts)

    expect(opts.pass).toBe('somesecret')
    expect(opts.path).toBe('/tmp/keystore')
    expect(opts.override).toBe(true)
    expect(opts.privateKey).toBe('0x123')
  })
})
