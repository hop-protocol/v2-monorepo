import wait from 'wait'
import { CrossChainMessenger, MessageStatus, hashLowLevelMessage } from '@eth-optimism/sdk'
import { EventFetcher, Hop } from '@hop-protocol/v2-sdk'
import { ethers } from 'ethers'
import { getSigner } from '../signer'

async function main () {
  const sdk = new Hop('goerli', {
    batchBlocks: 10_000
  })

  while (true) {
    try {
      const l1Provider = new ethers.providers.StaticJsonRpcProvider('https://goerli.rpc.hop.exchange')
      const l2Provider = new ethers.providers.StaticJsonRpcProvider('https://rpc.ankr.com/optimism_testnet')

      const eventFetcher = new EventFetcher({
        provider: l2Provider
      })

      const toBlock = await l2Provider.getBlockNumber()
      const fromBlock = toBlock - 1000

      // let fromBlock = 7963497 - 100
      // let toBlock = 7963497 + 100

      console.log('demoRelayer', fromBlock, toBlock)

      const spokeCoreMessenger = '0x323019faC2d13d439aE94765B901466BFA8eEAc1' // optimism
      const topic = '0xcd767b5406b2f63d8e220a45e7163c272f174d25a5015149cbf47baed68ff7e4' // MessageSent?
      const filter = {
        address: spokeCoreMessenger,
        topics: [topic]
      }

      const events = await eventFetcher.fetchEvents([filter], { fromBlock, toBlock })

      for (const event of events) {
        // const l2TxHash = '0x2ca02814b07290638d084f36163ee5bf6491f28270a442a6a0ac956a3b2eb7e0'
        const l2TxHash = event.transactionHash

        console.log('found l2TxHash', l2TxHash)

        const signer = getSigner()
        if (!signer) {
          throw new Error('no signer connected')
        }

        const l1Signer = signer.connect(l1Provider)

        const csm = new CrossChainMessenger({
          bedrock: true,
          l1ChainId: 5,
          l2ChainId: 420,
          l1SignerOrProvider: l1Signer,
          l2SignerOrProvider: l2Provider
        })

        let messageStatus = await csm.getMessageStatus(l2TxHash)
        if (messageStatus === MessageStatus.STATE_ROOT_NOT_PUBLISHED) {
          console.log('waiting for state root to be published')
          // wait a max of 240 seconds for state root to be published on L1
          await wait(240 * 1000)
        }

        messageStatus = await csm.getMessageStatus(l2TxHash)
        if (messageStatus === MessageStatus.READY_TO_PROVE) {
          console.log('message ready to prove')
          console.log('sending proveMessage tx')
          const resolved = await csm.toCrossChainMessage(l2TxHash)
          const tx = await csm.proveMessage(resolved)
          console.log('proveMessage tx:', tx.hash)
          await tx.wait()
          console.log('waiting challenge period')
          const challengePeriod = await csm.getChallengePeriodSeconds()
          await wait(challengePeriod * 1000)
        }

        messageStatus = await csm.getMessageStatus(l2TxHash)
        if (messageStatus === MessageStatus.IN_CHALLENGE_PERIOD) {
          console.log('message is in challenge period')
          // challenge period is a few seconds on goerli, 7 days in production
          const challengePeriod = await csm.getChallengePeriodSeconds()
          const latestBlock = await csm.l1Provider.getBlock('latest')
          const resolved = await csm.toCrossChainMessage(l2TxHash)
          const withdrawal = await csm.toLowLevelMessage(resolved)
          const provenWithdrawal =
            await csm.contracts.l1.OptimismPortal.provenWithdrawals(
              hashLowLevelMessage(withdrawal)
            )
          const timestamp = Number(provenWithdrawal.timestamp.toString())
          const bufferSeconds = 10
          const secondsLeft = (timestamp + challengePeriod + bufferSeconds) - Number(latestBlock.timestamp.toString())
          console.log('seconds left:', secondsLeft)
          await wait(secondsLeft * 1000)
        }

        messageStatus = await csm.getMessageStatus(l2TxHash)
        if (messageStatus === MessageStatus.READY_FOR_RELAY) {
          console.log('ready for relay')
          console.log('sending finalizeMessage tx')
          const tx = await csm.finalizeMessage(l2TxHash)
          console.log('finalizeMessage tx:', tx.hash)
          await tx.wait()
          return
        }

        if (messageStatus === MessageStatus.RELAYED) {
          console.log('message already relayed')
          return
        }

        console.log(MessageStatus)
        console.log(`not ready for relay. statusCode: ${messageStatus}`)
      }
    } catch (err: any) {
      console.error('demoRelayer error:', err)
    }
    await wait(10 * 1000)
  }
}

main()
