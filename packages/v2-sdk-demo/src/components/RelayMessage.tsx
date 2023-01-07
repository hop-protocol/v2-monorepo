import React, { useState, useEffect, useMemo } from 'react'
import { Signer, providers } from 'ethers'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Textarea from '@mui/material/TextareaAutosize'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'
import { Syntax } from './Syntax'
import { ChainSelect } from './ChainSelect'
import { useStyles } from './useStyles'

type Props = {
  signer: Signer
  sdk: Hop
  onboard: any
}

export function RelayMessage (props: Props) {
  const { signer, sdk, onboard } = props
  const styles = useStyles()
  const [fromChainId, setFromChainId] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:fromChainId')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '420'
  })
  const [toChainId, setToChainId] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:toChainId')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '5'
  })
  const [fromAddress, setFromAddress] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:fromAddress')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [toAddress, setToAddress] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:toAddress')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [toCalldata, setToCalldata] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:toCalldata')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [txData, setTxData] = useState('')
  const [bundleProof, setBundleProof] = useState(() => {
    try {
      const cached = localStorage.getItem('relayMessage:bundleProof')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [populateTxDataOnly, setPopulateTxDataOnly] = useState(true)
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:fromChainId', fromChainId)
    } catch (err: any) {
      console.error(err)
    }
  }, [fromChainId])

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:toChainId', toChainId)
    } catch (err: any) {
      console.error(err)
    }
  }, [toChainId])

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:fromAddress', fromAddress)
    } catch (err: any) {
      console.error(err)
    }
  }, [fromAddress])

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:toAddress', toAddress)
    } catch (err: any) {
      console.error(err)
    }
  }, [toAddress])

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:toCalldata', toCalldata)
    } catch (err: any) {
      console.error(err)
    }
  }, [toCalldata])

  useEffect(() => {
    try {
      localStorage.setItem('relayMessage:bundleProof', bundleProof)
    } catch (err: any) {
      console.error(err)
    }
  }, [bundleProof])

  async function getSendTxData() {
    const args = {
      fromChainId: Number(fromChainId),
      toChainId: Number(toChainId),
      fromAddress,
      toAddress,
      toCalldata,
      bundleProof: JSON.parse(bundleProof.trim())
    }
    console.log('args', args)
    const txData = await sdk.getRelayMessagePopulatedTx(args)
    return txData
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setError('')
      setTxData('')
      setTxHash('')
      setLoading(true)
      const txData = await getSendTxData()
      setTxData(JSON.stringify(txData, null, 2))
      if (!populateTxDataOnly) {
        let _signer = signer
        if (!_signer) {
          const wallets = await onboard.connectWallet()
          const ethersProvider = new providers.Web3Provider(
            wallets[0].provider,
            'any'
          )
          _signer = ethersProvider.getSigner()
        }

        const success = await onboard.setChain({ chainId: Number(toChainId) })
        if (success) {
          const tx = await _signer.sendTransaction(txData)
          setTxHash(tx.hash)
        }
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  const _bundleProof = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(bundleProof.trim()), null, 2)
    } catch (err: any) {
      return '{}'
    }
  }, [bundleProof])

  const code = `
${populateTxDataOnly ? `
import { Hop } from '@hop-protocol/v2-sdk'
`.trim() : `
import { Hop } from '@hop-protocol/v2-sdk'
import { ethers } from 'ethers'
`.trim()}

async function main() {
  const fromChainId = ${fromChainId || 'undefined'}
  const toChainId = ${toChainId || 'undefined'}
  const fromAddress = "${fromAddress}"
  const toAddress = "${toAddress}"
  const toCalldata = "${toCalldata}"
  const bundleProof = ${_bundleProof}

  const hop = new Hop('goerli')
  const txData = await hop.getRelayMessagePopulatedTx({
    fromChainId,
    toChainId,
    fromAddress,
    toAddress,
    toCalldata,
    bundleProof
  })
  ${populateTxDataOnly ? (
  'console.log(txData)'
  ) : (
  `
  const provider = new ethers.providers.Web3Provider(
    window.ethereum
  )
  const signer = provider.getSigner()
  const tx = await signer.sendTransaction(txData)
  console.log(tx)
  `.trim()
  )}
}

main().catch(console.error)
`.trim()

  return (
    <Box>
      <Box mb={1}>
        <Typography variant="h5">Relay Message</Typography>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle1">Relay and execute message at the destination</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between" className={styles.container}>
        <Box mr={4} className={styles.formContainer}>
          <Box>
            <form onSubmit={handleSubmit}>
              <Box mb={2}>
                <Box mb={1}>
                  <label>From Chain ID <small><em>(number)</em></small></label>
                </Box>
                {/*<TextField fullWidth placeholder="420" value={fromChainId} onChange={event => setFromChainId(event.target.value)} />*/}
                <ChainSelect value={fromChainId} chains={['420', '5']} onChange={value => setFromChainId(value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>To Chain ID <small><em>(number)</em></small></label>
                </Box>
                {/*<TextField fullWidth placeholder="5" value={toChainId} onChange={event => setToChainId(event.target.value)} />*/}
                <ChainSelect value={toChainId} chains={['420', '5']} onChange={value => setToChainId(value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>From <small><em>(address)</em></small></label>
                </Box>
                <TextField fullWidth placeholder="0x" value={fromAddress} onChange={event => setFromAddress(event.target.value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>To <small><em>(address)</em></small></label>
                </Box>
                <TextField fullWidth placeholder="0x" value={toAddress} onChange={event => setToAddress(event.target.value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>Data <small><em>(hex string)</em></small></label>
                </Box>
                <Textarea minRows={5} placeholder="0x" value={toCalldata} onChange={event => setToCalldata(event.target.value)} style={{ width: '100%' }} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>Bundle Proof <small><em>(JSON)</em></small></label>
                </Box>
                <Textarea minRows={5} placeholder={`
{
  "bundleId": "",
  "treeIndex": 0,
  "siblings": [],
  "totalLeaves": 0
}
                `.trim()} value={bundleProof} onChange={event => setBundleProof(event.target.value)} style={{ width: '100%' }} />
              </Box>
              <Box mb={2}>
                <Box>
                  <Checkbox onChange={event => setPopulateTxDataOnly(event.target.checked)} checked={populateTxDataOnly} />
                  <label>Populate Tx Only</label>
                </Box>
              </Box>
              <Box mb={2} display="flex" justifyContent="center">
                <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">{populateTxDataOnly ? 'Get tx data' : 'Send'}</LoadingButton>
              </Box>
            </form>
          </Box>
          {!!error && (
            <Box mb={4} width="100%" style={{ wordBreak: 'break-word' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          {!!txHash && (
            <Box mb={4}>
              <Alert severity="success">Tx hash: {txHash}</Alert>
            </Box>
          )}
          {!!txData && (
            <Box>
              <Box mb={2}>
                <Typography variant="body1">Output</Typography>
              </Box>
              <pre style={{
                maxWidth: '500px',
                overflow: 'auto'
              }}>
                {txData}
              </pre>
            </Box>
          )}
        </Box>
        <Box width="100%">
          <Box mb={2}>
            <Typography variant="subtitle1">Code example</Typography>
          </Box>
          <Box>
            <Syntax code={code} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
