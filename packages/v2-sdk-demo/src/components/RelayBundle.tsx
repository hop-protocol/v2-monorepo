import React, { useState } from 'react'
import { Signer } from 'ethers'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'

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
      setTxData('')
      setTxHash('')
      const txData = await getSendTxData()
      setTxData(JSON.stringify(txData, null, 2))
      if (!populateTxDataOnly) {
        const success = await onboard.setChain({ chainId: Number(fromChainId) })
        if (!success) {
          return
        }
        const tx = await signer.sendTransaction({
          ...txData
        })
        setTxHash(tx.hash)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5">Relay Bundle</Typography>
      </Box>
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
          <Button fullWidth type="submit" variant="contained" size="large">{populateTxDataOnly ? 'Get tx data' : 'Send'}</Button>
        </Box>
      </form>
      <Box>
        <Box>
          <textarea readOnly value={txData} />
        </Box>
        {!!txHash && (
          <Box>
            tx hash: {txHash}
          </Box>
        )}
      </Box>
    </Box>
  )
}
