import { BigNumber } from 'ethers'
import { LiquidityHub } from '@hop-protocol/v2-sdk'
import { actionHandler, parseString, root } from './shared'
import { getSigner } from '../signer'

root
  .command('post-claim')
  .description('Post claim')
  .option('--chain-id <number>', 'Chain', parseString)
  .option('--token <address>', 'Token', parseString)
  .option('--token-bus-id <string>', 'Token Bus ID', parseString)
  .action(actionHandler(main))

async function main (source: any) {
  const { chainId, token, tokenBusId } = source

  if (!token) {
    throw new Error('token is required')
  }
  if (!chainId) {
    throw new Error('chainId is required')
  }
  if (!tokenBusId) {
    throw new Error('token bus ID is required')
  }

  console.log('post claim', chainId, token)
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
  const to = '' // TODO
  const amount = BigNumber.from(0) // TODO
  const minAmountOut = liquidityHub.calcAmountOutMin({ amountOut: amount, slippageTolerance })
  const sourceClaimsSent = BigNumber.from(0) // TODO
  const tx = await liquidityHub.postClaim({ tokenBusId, to, amount, minAmountOut, sourceClaimsSent })
  console.log('stake hop tx:', tx.hash)
  await tx.wait()
  console.log('stake hop tx confirmed')
}
