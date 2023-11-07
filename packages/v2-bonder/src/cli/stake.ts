import { actionHandler, parseBool, parseNumber, parseString, root } from './shared'
import { LiquidityHub } from '@hop-protocol/v2-sdk'
import { parseUnits } from 'ethers/lib/utils'
import { getSigner } from '../signer'

root
  .command('stake')
  .description('Stake HOP tokens on liqiudity hub')
  .option('--chain-id <number>', 'Chain', parseString)
  .option('--token <address>', 'Token', parseString)
  .option('--amount <number>', 'Amount (in human readable format)', parseNumber)
  .action(actionHandler(main))

async function main (source: any) {
  const { chainId, token, amount } = source

  if (!amount) {
    throw new Error('amount is required. E.g. 100')
  }
  if (!chainId) {
    throw new Error('chainId is required')
  }
  if (!token) {
    throw new Error('token address is required')
  }

  console.log('stake', chainId, token, amount)
  const address = '' // TODO: liquidity hub address
  const signer = getSigner()
  if (!signer) {
    throw new Error(`No signer found for chain ${chainId}`)
  }
  const liquidityHub = new LiquidityHub({
    signer,
    address
  })

  const role = '' // TODO
  const amountBn = parseUnits(amount, 18)
  const tx = await liquidityHub.stakeHop({ role, amount: amountBn })
  console.log('stake hop tx:', tx.hash)
  await tx.wait()
  console.log('stake hop tx confirmed')
}
