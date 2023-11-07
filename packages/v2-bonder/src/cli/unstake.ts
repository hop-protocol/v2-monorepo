import { actionHandler, parseBool, parseNumber, parseString, root } from './shared'
import { getSigner } from '../signer'
import { LiquidityHub } from '@hop-protocol/v2-sdk'
import { parseUnits } from 'ethers/lib/utils'

root
  .command('unstake')
  .description('Unstake HOP tokens from liquidity hub')
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

  console.log('unstake', chainId, token, amount)

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
  const tx = await liquidityHub.unstakeHop({ role, amount: amountBn })
  console.log('unstake hop tx:', tx.hash)
  await tx.wait()
  console.log('unstake hop tx confirmed')
}
