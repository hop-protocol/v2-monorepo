import React, { useState, useEffect } from 'react'
import wait from 'wait'
import { Signer, providers } from 'ethers'
import { Interface, defaultAbiCoder, getAddress } from 'ethers/lib/utils'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'
import { useStyles } from './useStyles'
import { ChainSelect } from './ChainSelect'
import { goerliHubFactoryAddress } from '../config'

type Props = {
  signer: Signer
  sdk: Hop
  onboard: any
}

console.log(`
goerli hub factory: 0x34655508eb75469dd240A5C1b47594386a67C6b2
goerli optimism hub factory: 0x34655508eb75469dd240A5C1b47594386a67C6b2
`)

export function ConnectTargets (props: Props) {
  const { signer, sdk, onboard } = props
  const styles = useStyles()
  const [chainId1, setChainId1] = useState(() => {
    try {
      const cached = localStorage.getItem('connectTargets:chainId1')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '5'
  })
  const [chainId2, setChainId2] = useState(() => {
    try {
      const cached = localStorage.getItem('connectTargets:chainId2')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '420'
  })
  const [target1, setTarget1] = useState(() => {
    try {
      const cached = localStorage.getItem('connectTargets:target1')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [target2, setTarget2] = useState(() => {
    try {
      const cached = localStorage.getItem('connectTargets:target2')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [txHash, setTxHash] = useState('')
  const [chainId1Connector, setChainId1Connector] = useState('')
  const [chainId2Connector, setChainId2Connector] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('connectTargets:chainId1', chainId1)
    } catch (err: any) {
      console.error(err)
    }
  }, [chainId1])

  useEffect(() => {
    try {
      localStorage.setItem('connectTargets:chainId2', chainId2)
    } catch (err: any) {
      console.error(err)
    }
  }, [chainId2])

  useEffect(() => {
    try {
      localStorage.setItem('connectTargets:target1', target1)
    } catch (err: any) {
      console.error(err)
    }
  }, [target1])

  useEffect(() => {
    try {
      localStorage.setItem('connectTargets:target2', target2)
    } catch (err: any) {
      console.error(err)
    }
  }, [target2])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setError('')
      setTxHash('')
      setLoading(true)

      let _signer = signer
      if (!_signer) {
        const wallets = await onboard.connectWallet()
        const ethersProvider = new providers.Web3Provider(
          wallets[0].provider,
          'any'
        )
        _signer = ethersProvider.getSigner()
      }

      const success = await onboard.setChain({ chainId: 5 })
      if (success) {
        const ABI = [
          'function connectTargets(uint256 chainId1, address target1, uint256 chainId2, address target2) public returns (address)'
        ]

        const iface = new Interface(ABI)
        const args = [chainId1, target1, chainId2, target2]
        console.log('args', args)
        const data = iface.encodeFunctionData('connectTargets', args)
        const txData = {
          to: goerliHubFactoryAddress,
          data,
          // gasLimit: 1_000_000
        }
        const tx = await _signer?.sendTransaction({
          ...txData
        })
        setTxHash(tx.hash)

        const rpcUrls: any = {
          5: 'https://rpc.ankr.com/eth_goerli',
          420: 'https://rpc.ankr.com/optimism_testnet'
        }

        const pollChainId1Events = async () => {
          const chain1Provider = new providers.StaticJsonRpcProvider(rpcUrls[chainId1])
          while (true) {
            const endBlock = await chain1Provider.getBlockNumber()
            const filter = {
              topics: [
                '0x7c3b4700db7fc735491356ffbf2c0be2d190ede4d5a831be608899740a84e573',
                null,
                defaultAbiCoder.encode(['address'], [target1])
              ],
              startBlock: endBlock - 100,
              endBlock
            }
            const logs = await chain1Provider.getLogs(filter)
            if (logs.length > 0) {
              for (const log of logs) {
                if (log.topics[2] === defaultAbiCoder.encode(['address'], [target1])) {
                  const connectorAddress = getAddress(`0x${log.topics[1].slice(26)}`)
                  setChainId1Connector(connectorAddress)
                }
              }
              break
            }
            await wait(5 * 1000)
          }
        }

        pollChainId1Events().catch(console.error)

        const pollChainId2Events = async () => {
          const chain2Provider = new providers.StaticJsonRpcProvider(rpcUrls[chainId2])
          while (true) {
            const endBlock = await chain2Provider.getBlockNumber()
            const filter = {
              topics: [
                '0x7c3b4700db7fc735491356ffbf2c0be2d190ede4d5a831be608899740a84e573',
                null,
                defaultAbiCoder.encode(['address'], [target2])
              ],
              startBlock: endBlock - 100,
              endBlock
            }
            const logs = await chain2Provider.getLogs(filter)
            if (logs.length > 0) {
              for (const log of logs) {
                if (log.topics[2] === defaultAbiCoder.encode(['address'], [target2])) {
                  const connectorAddress = getAddress(`0x${log.topics[1].slice(26)}`)
                  setChainId2Connector(connectorAddress)
                }
              }
              break
            }
            await wait(5 * 1000)
          }
        }

        pollChainId1Events().catch(console.error)
        // pollChainId2Events().catch(console.error)

        const receipt = await tx.wait()
        console.log(receipt)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <Box>
      <Box mb={1}>
        <Typography variant="h5">Connect Targets</Typography>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle1">Connect two target addresses on different chains</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between" flexDirection="column" className={styles.container}>
        <Box className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <Box mb={1}>
                <label>Chain 1</label>
              </Box>
              <ChainSelect value={'5'} chains={['5']} onChange={chainId => setChainId1(chainId)} />
            </Box>
            <Box mb={2}>
              <Box mb={1}>
                <label>Target 1 <small><em>(address)</em></small></label>
              </Box>
              <TextField fullWidth placeholder="0x" value={target1} onChange={event => setTarget1(event.target.value)} />
            </Box>
            <Box mb={2}>
              <Box mb={1}>
                <label>Chain 2</label>
              </Box>
              <ChainSelect value={'420'} chains={['420']} onChange={chainId => setChainId2(chainId)} />
            </Box>
            <Box mb={2}>
              <Box mb={1}>
                <label>Target 2 <small><em>(address)</em></small></label>
              </Box>
              <TextField fullWidth placeholder="0x" value={target2} onChange={event => setTarget2(event.target.value)} />
            </Box>
            <Box mb={2} display="flex" justifyContent="center">
              <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">Send</LoadingButton>
            </Box>
          </form>
          {!!error && (
            <Box mb={4} width="100%" style={{ wordBreak: 'break-word' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          {!!chainId1Connector && (
            <Box mb={4}>
              <Alert severity="info">Chain Connector: {chainId1Connector}</Alert>
            </Box>
          )}
          {!!chainId2Connector && (
            <Box mb={4}>
              <Alert severity="info">Chain 2 Connector: {chainId2Connector}</Alert>
            </Box>
          )}
          {!!txHash && (
            <Box mb={4}>
              <Alert severity="success">Tx hash: {txHash}</Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
