import React, { useState } from 'react'
import { Signer } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Textarea from '@mui/material/TextareaAutosize'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'

type Props = {
  signer: Signer
  sdk: Hop
  onboard: any
}

export function SendMessage (props: Props) {
  const { signer, sdk, onboard } = props
  const [fromChainId, setFromChainId] = useState('420')
  const [toChainId, setToChainId] = useState('5')
  const [toAddress, setToAddress] = useState('')
  const [toCalldata, setToCalldata] = useState('')
  const [txData, setTxData] = useState('')
  const [populateTxDataOnly, setPopulateTxDataOnly] = useState(true)
  const [txHash, setTxHash] = useState('')

  async function getSendTxData() {
    const args = [
      Number(fromChainId), Number(toChainId), toAddress, toCalldata
    ] as const
    console.log('args', args)
    const txData = await sdk.getSendMessagePopulatedTx(...args)
    return txData
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setTxData('')
      setTxHash('')
      const txData = await getSendTxData()
      setTxData(JSON.stringify(txData, null, 2))
      const fee = parseEther('0.000001')
      if (!populateTxDataOnly) {
        const success = await onboard.setChain({ chainId: Number(fromChainId) })
        if (!success) {
          return
        }
        const tx = await signer.sendTransaction({
          ...txData,
          value: fee
        })
        setTxHash(tx.hash)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Typography variant="h5">Send Message</Typography>
      <form onSubmit={handleSubmit}>
        <Box>
          <Box>
            <label>From Chain ID</label>
          </Box>
          <TextField placeholder="420" value={fromChainId} onChange={event => setFromChainId(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>To Chain ID</label>
          </Box>
          <TextField placeholder="5" value={toChainId} onChange={event => setToChainId(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>To</label>
          </Box>
          <TextField placeholder="0x" value={toAddress} onChange={event => setToAddress(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>Data</label>
          </Box>
          <Textarea cols={50} minRows={5} placeholder="0x" value={toCalldata} onChange={event => setToCalldata(event.target.value)} />
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
