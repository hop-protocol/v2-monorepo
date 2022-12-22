import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'
import { Syntax } from './Syntax'

type Props = {
  sdk: Hop
}

export function GetBundleProof (props: Props) {
  const { sdk } = props
  const [fromChainId, setFromChainId] = useState(() => {
    try {
      const cached = localStorage.getItem('getBundleProof:fromChainId')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '420'
  })
  const [toChainId, setToChainId] = useState(() => {
    try {
      const cached = localStorage.getItem('getBundleProof:toChainId')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '5'
  })
  const [txHash, setTxHash] = useState(() => {
    try {
      const cached = localStorage.getItem('getBundleProof:txHash')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [bundleProof, setBundleProof] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('getBundleProof:fromChainId', fromChainId)
    } catch (err: any) {
      console.error(err)
    }
  }, [fromChainId])

  useEffect(() => {
    try {
      localStorage.setItem('getBundleProof:toChainId', toChainId)
    } catch (err: any) {
      console.error(err)
    }
  }, [toChainId])

  useEffect(() => {
    try {
      localStorage.setItem('getBundleProof:txHash', txHash)
    } catch (err: any) {
      console.error(err)
    }
  }, [txHash])

  async function getBundleProof() {
    const args = [
      Number(fromChainId),
      txHash
    ] as const
    console.log('args', args)
    const proof = await sdk.getBundleProof(...args)
    return proof
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setError('')
      setBundleProof('')
      setLoading(true)
      const proof = await getBundleProof()
      setBundleProof(JSON.stringify(proof, null, 2))
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  const code = `
import { Hop } from '@hop-protocol/v2-sdk'

async function main() {
  const fromChainId = ${fromChainId || 'undefined'}
  const toChainId = ${toChainId || 'undefined'}
  const transactionHash = "${txHash}"

  const hop = new Hop('goerli')
  const bundleProof = await hop.getBundleProof(
    fromChainId,
    transactionHash
  )
  console.log(bundleProof)
}

main().catch(console.error)
`.trim()

  return (
    <Box>
      <Box mb={1}>
        <Typography variant="h5">Get Bundle Proof</Typography>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle1">Get bundle proof needed to relay message at destination chain</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box minWidth="400px" mr={4}>
          <Box>
            <form onSubmit={handleSubmit}>
              <Box mb={2}>
                <Box mb={1}>
                  <label>From Chain ID <small><em>(number)</em></small></label>
                </Box>
                <TextField fullWidth placeholder="420" value={fromChainId} onChange={event => setFromChainId(event.target.value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>To Chain ID <small><em>(number)</em></small></label>
                </Box>
                <TextField fullWidth placeholder="5" value={toChainId} onChange={event => setToChainId(event.target.value)} />
              </Box>
              <Box mb={2}>
                <Box mb={1}>
                  <label>Transaction Hash <small><em>(hex)</em></small></label>
                </Box>
                <TextField fullWidth placeholder="0x" value={txHash} onChange={event => setTxHash(event.target.value)} />
              </Box>
              <Box mb={2} display="flex" justifyContent="center">
                <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">Get Bundle Proof</LoadingButton>
              </Box>
            </form>
          </Box>
          {!!error && (
            <Box mb={4} width="100%" style={{ wordBreak: 'break-word' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          {!!bundleProof && (
            <Box>
              <Box mb={2}>
                <Typography variant="body1">Output</Typography>
              </Box>
              <pre style={{
                maxWidth: '500px',
                overflow: 'auto'
              }}>
                {bundleProof}
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
