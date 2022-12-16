import React, { useState } from 'react'
import { Signer, providers } from 'ethers'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'
import { Syntax } from './Syntax'

type Props = {
  signer: Signer
  sdk: Hop
  onboard: any
}

export function RelayBundle (props: Props) {
  const { signer, sdk, onboard } = props
  const [fromChainId, setFromChainId] = useState('420')
  const [bundleCommittedTxHash, setBundleCommittedTxHash] = useState('')
  const [txData, setTxData] = useState('')
  const [populateTxDataOnly, setPopulateTxDataOnly] = useState(true)
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function getSendTxData() {
    const args = [
      Number(fromChainId),
      bundleCommittedTxHash
    ] as const
    console.log('args', args)
    const txData = await sdk.getBundleExitPopulatedTx(...args)
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

        const success = await onboard.setChain({ chainId: Number(fromChainId) })
        if (success) {
          const tx = await _signer.sendTransaction({
            ...txData
          })
          setTxHash(tx.hash)
        }
      }
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
  const bundleCommittedTxHash = "${bundleCommittedTxHash}"

  const hop = new Hop('goerli')
  const txData = await hop.getBundleExitPopulatedTx(fromChainId, bundleCommittedTxHash)
  ${populateTxDataOnly ? (
  'console.log(txData)'
  ) : (
  `
  const tx = await signer.sendTransaction(txData)
  console.log(tx)
  `.trim()
  )}
}

main().catch(console.error)
`.trim()

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5">Relay Bundle</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box minWidth="400px" mr={4}>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <Box mb={1}>
                <label>From Chain ID <small><em>(number)</em></small></label>
              </Box>
              <TextField fullWidth placeholder="420" value={fromChainId} onChange={event => setFromChainId(event.target.value)} />
            </Box>
            <Box mb={2}>
              <Box mb={1}>
                <label>From Chain Bundle Committed Tx Hash <small><em>(hex string)</em></small></label>
              </Box>
              <TextField fullWidth placeholder="0x" value={bundleCommittedTxHash} onChange={event => setBundleCommittedTxHash(event.target.value)} />
            </Box>
            <Box mb={2}>
              <Box mb={1}>
                <Checkbox onChange={event => setPopulateTxDataOnly(event.target.checked)} checked={populateTxDataOnly} />
                <label>Populate Tx Only</label>
              </Box>
            </Box>
            <Box mb={2} display="flex" justifyContent="center">
              <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">{populateTxDataOnly ? 'Get tx data' : 'Send'}</LoadingButton>
            </Box>
          </form>
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
