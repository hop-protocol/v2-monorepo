import React, { useState } from 'react'
import { Signer, providers } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
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
  const [loading, setLoading] = useState(false)

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
      setLoading(true)
      const txData = await getSendTxData()
      setTxData(JSON.stringify(txData, null, 2))
      const fee = await sdk.getMessageFee(Number(fromChainId), Number(toChainId))
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
            ...txData,
            value: fee
          })
          setTxHash(tx.hash)
        }
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    }
    setLoading(false)
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5">Send Message</Typography>
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
            <label>To Chain ID <small><em>(number)</em></small></label>
          </Box>
          <TextField fullWidth placeholder="5" value={toChainId} onChange={event => setToChainId(event.target.value)} />
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
          <Box>
            <Checkbox onChange={event => setPopulateTxDataOnly(event.target.checked)} checked={populateTxDataOnly} />
            <label>Populate Tx Only</label>
          </Box>
        </Box>
        <Box mb={2} display="flex" justifyContent="center">
          <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">{populateTxDataOnly ? 'Get tx data' : 'Send'}</LoadingButton>
        </Box>
      </form>
      <Box>
        {!!txData && (
          <pre style={{
            maxWidth: '500px',
            overflow: 'auto'
          }}>
            {txData}
          </pre>
        )}
        {!!txHash && (
          <Box>
            Tx hash: {txHash}
          </Box>
        )}
      </Box>
    </Box>
  )
}
