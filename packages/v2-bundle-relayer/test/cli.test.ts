import path from 'path'
import { exec } from 'child_process'
import { keystoreProgram } from 'src/cli/keystore'
import { workerProgram } from 'src/cli/worker'

async function cli (args: any, cwd: any = '.'): Promise<any> {
  return new Promise(resolve => {
    exec(`node ${path.resolve(__dirname, '../bin/relayer')} ${args.join(' ')}`,
      { cwd },
      (error: any, stdout: any, stderr: any) => {
        resolve({
          code: error?.code ?? 0,
          error,
          stdout,
          stderr
        })
      })
  })
}

describe('cli', () => {
  describe('worker', () => {
    it('should correctly parse options', async () => {
      workerProgram.parse([
        'node',
        './bin/relayer',
        'worker',
        '--dry',
        '--server',
        '--indexer-poll-seconds',
        '10',
        '--exit-bundle-poll-seconds',
        '20',
        '--exit-bundle-retry-delay-seconds',
        '60',
        '--skip-main'
      ])

      const opts = workerProgram.opts()
      console.log('opts', opts)

      expect(opts.dry).toBe(true)
      expect(opts.server).toBe(true)
      expect(opts.indexerPollSeconds).toBe(10)
      expect(opts.exitBundlePollSeconds).toBe(20)
      expect(opts.exitBundleRetryDelaySeconds).toBe(60)
    })
    it.skip('should start without error', async () => {
      const result = await cli(['worker', '--server'])
      expect(result.code).toBe(0)
    }, 60 * 1000)
  })
  describe('keystore', () => {
    const filepath = `/tmp/keystore_${Date.now()}.json`
    it('should correctly parse options', async () => {
      keystoreProgram.parse([
        'node',
        './bin/relayer',
        'generate',
        '--pass',
        'somesecret',
        '--newpass',
        'mynewsecret',
        '--path',
        '/tmp/keystore.json',
        '--override',
        '--skip-interactive-prompts',
        '--private-key',
        '123',
        '--skip-main'
      ])

      const opts = keystoreProgram.opts()
      console.log('opts', opts)

      expect(opts.pass).toBe('somesecret')
      expect(opts.newpass).toBe('mynewsecret')
      expect(opts.path).toBe('/tmp/keystore.json')
      expect(opts.override).toBe(true)
      expect(opts.privateKey).toBe('123')
    })
    it('should generate keystore', async () => {
      const result = await cli(['keystore', 'generate', '--path', filepath, '--pass', 'somesecret', '--skip-interactive-prompts'])
      console.log('result', result)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Public address')

      const result2 = await cli(['keystore', 'generate', '--path', filepath, '--pass', 'somesecret', '--skip-interactive-prompts'])
      console.log('result2', result2)
      expect(result2.code).toBe(1)
      expect(result2.stderr).toContain('file exists')

      const result3 = await cli(['keystore', 'generate', '--path', filepath, '--pass', 'somesecret', '--skip-interactive-prompts', '--override'])
      console.log('result', result3)
      expect(result3.code).toBe(0)
      expect(result3.stdout).toContain('Public address')
    }, 60 * 1000)
    it('should show address', async () => {
      console.log(filepath)
      const result = await cli(['keystore', 'address', '--path', filepath])
      console.log('result', result)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('0x')
    })
    it('should decrypt keystore', async () => {
      console.log(filepath)
      const result = await cli(['keystore', 'decrypt', '--path', filepath, '--pass', 'somesecret'])
      console.log('result', result)
      expect(result.code).toBe(0)
      expect(result.stdout).not.toBe('')
    })
    it('should rencrypt keystore', async () => {
      console.log(filepath)
      const result = await cli(['keystore', 'reencrypt', '--path', filepath, '--pass', 'somesecret', '--newpass', 'mynewsecret'])
      console.log('result', result)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Public address')
    })
  })
})
