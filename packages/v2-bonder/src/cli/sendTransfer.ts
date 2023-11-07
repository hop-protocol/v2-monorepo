import { LiquidityHub } from '@hop-protocol/v2-sdk'
import { actionHandler, parseNumber, parseString, root } from './shared'
import { getSigner } from '../signer'
import { parseUnits } from 'ethers/lib/utils'

root
  .command('send-transfer')
  .description('Send transfer using liquidity hub')
  .option('--chain-id <number>', 'Chain', parseString)
  .option('--token <address>', 'Token', parseString)
  .option('--amount <number>', 'Amount (in human readable format)', parseNumber)
  .action(actionHandler(main))

async function main (source: any) {
  const { chainId, token, amount } = source

  if (!token) {
    throw new Error('token is required')
  }
  if (!chainId) {
    throw new Error('chainId is required')
  }
  if (!amount) {
    throw new Error('amount is required')
  }

  console.log('send-transfer', chainId, token)
  const address = '' // TODO: liquidity hub address
  const signer = getSigner()
  if (!signer) {
    throw new Error(`No signer found for chain ${chainId}`)
  }
  const liquidityHub = new LiquidityHub({
    signer,
    address
  })

  const slippageTolerance = 0.05
  const tokenBusId = '' // TODO
  const amountBn = parseUnits(amount, 18)
  const minAmountOut = liquidityHub.calcAmountOutMin({ amountOut: amountBn, slippageTolerance })
  const to = await signer.getAddress()
  const tx = await liquidityHub.send({ tokenBusId, to, amount: amountBn, minAmountOut })
  console.log('stake hop tx:', tx.hash)
  await tx.wait()
  console.log('stake hop tx confirmed')
}
