import { actionHandler, parseBool, parseNumber, parseString, root } from './shared'
import { LiquidityHub } from '@hop-protocol/v2-sdk'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { getSigner } from '../signer'

root
  .command('bond')
  .description('Bond transfer')
  .option('--chain-id <number>', 'Chain', parseString)
  .option('--token <address>', 'Token', parseString)
  .option('--claim-id <string>', 'Claim ID', parseString)
  .action(actionHandler(main))

async function main (source: any) {
  const { chainId, claimId, token } = source

  if (!token) {
    throw new Error('token is required')
  }
  if (!chainId) {
    throw new Error('chainId is required')
  }
  if (!claimId) {
    throw new Error('claim ID is required')
  }

  console.log('bond', chainId, )
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
  const to = '' // TODO
  const amount = BigNumber.from(0) // TODO
  const minAmountOut = liquidityHub.calcAmountOutMin({ amountOut: amount, slippageTolerance })
  const sourceClaimsSent = BigNumber.from(0) // TODO
  const tx = await liquidityHub.bond({ tokenBusId, to, amount, minAmountOut, sourceClaimsSent })
  console.log('stake hop tx:', tx.hash)
  await tx.wait()
  console.log('stake hop tx confirmed')
}
