import React, { useState } from 'react'
import { Signer } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Textarea from '@mui/material/TextareaAutosize'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
const Buffer = require('buffer/').Buffer
if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer
}

type Props = {
  signer: Signer
  sdk: any
}

export function RelayBundle (props: Props) {
  const { signer, sdk } = props
  const [fromChainId, setFromChainId] = useState('420')
  const [bundleCommittedTxHash, setBundleCommittedTxHash] = useState('')
  const [txData, setTxData] = useState('')
  const [populateTxDataOnly, setPopulateTxDataOnly] = useState(true)
  const [txHash, setTxHash] = useState('')

  async function getSendTxData() {
    const args = [
      Number(fromChainId),
      bundleCommittedTxHash
    ]
    console.log('args', args)
    const txData = await sdk.getBundleExitPopulatedTx(fromChainId, bundleCommittedTxHash)
    return txData
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setTxData('')
      setTxHash('')
      const txData = await getSendTxData()
      console.log('TX', txData)
      setTxData(JSON.stringify(txData, null, 2))
      if (!populateTxDataOnly) {
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
      <Typography variant="h5">Relay Bundle</Typography>
      <form onSubmit={handleSubmit}>
        <Box>
          <Box>
            <label>From Chain ID</label>
          </Box>
          <TextField placeholder="420" value={fromChainId} onChange={event => setFromChainId(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>From Chain Bundle Committed Tx Hash</label>
          </Box>
          <TextField placeholder="0x" value={bundleCommittedTxHash} onChange={event => setBundleCommittedTxHash(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>Populate Tx Only</label>
          </Box>
          <Checkbox onChange={event => setPopulateTxDataOnly(event.target.checked)} checked={populateTxDataOnly} />
        </Box>
        <Button type="submit">Send</Button>
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
