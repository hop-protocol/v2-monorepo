import React, { useState, useMemo } from 'react'
import { Signer } from 'ethers'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'

type Props = {
  signer: Signer
  sdk: Hop
}

export function GetEvents (props: Props) {
  const { signer, sdk } = props
  const [chainId, setChainId] = useState('420')
  const [startBlock, setStartBlock] = useState('')
  const [endBlock, setEndBlock] = useState('')
  const [events, setEvents] = useState('')
  const [loading, setLoading] = useState(false)
  const eventNames = useMemo(() => {
    return sdk?.getEventNames() ?? []
  }, [sdk])
  const [selectedEventNames, setSelectedEventNames] = useState<string[]>([eventNames[0]])

  async function getEvents() {
    const provider = sdk.providers[sdk.getChainSlug(Number(chainId))]
    const latestBlock = await provider.getBlockNumber()
    let _startBlock = Number(startBlock)
    let _endBlock = Number(endBlock)
    if (latestBlock) {
      if (!endBlock) {
        setEndBlock(latestBlock.toString())
        _endBlock = latestBlock
      }
      if (!startBlock) {
        const start = latestBlock - 1000
        setStartBlock(start.toString())
        _startBlock = start
      }
      if (_startBlock < 0) {
        _startBlock = _endBlock + _startBlock
        setStartBlock(_startBlock.toString())
      }
    }
    const args = [
      selectedEventNames,
      Number(chainId),
      _startBlock,
      _endBlock
    ] as const
    console.log('args', args)
    const _events = await sdk.getEvents(...args)
    return _events
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setEvents('')
      setLoading(true)
      const _events = await getEvents()
      setEvents(JSON.stringify(_events, null, 2))
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    }
    setLoading(false)
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5">Get Events</Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <Box mb={1}>
            <label>Event names <small><em>(multiple selection allowed)</em></small></label>
          </Box>
          <select multiple value={selectedEventNames} onChange={event => setSelectedEventNames(Object.values(event.target.selectedOptions).map(x => x.value))} style={{ width: '100%', height: '200px' }}>
            {eventNames.map((eventName: string) => {
              return (
                <option key={eventName} value={eventName}>{eventName}</option>
              )
            })}
          </select>
        </Box>
        <Box mb={2}>
          <Box mb={1}>
            <label>Chain ID <small><em>(number)</em></small></label>
          </Box>
          <TextField fullWidth placeholder="420" value={chainId} onChange={event => setChainId(event.target.value)} />
        </Box>
        <Box mb={2}>
          <Box mb={1}>
            <label>Start block <small><em>(number)</em></small></label>
          </Box>
          <TextField fullWidth placeholder="0" value={startBlock} onChange={event => setStartBlock(event.target.value)} />
        </Box>
        <Box mb={2}>
          <Box mb={1}>
            <label>End block <small><em>(number)</em></small></label>
          </Box>
          <TextField fullWidth placeholder="0" value={endBlock} onChange={event => setEndBlock(event.target.value)} />
        </Box>
        <Box mb={2} display="flex" justifyContent="center">
          <LoadingButton loading={loading} fullWidth type="submit" variant="contained" size="large">Get events</LoadingButton>
        </Box>
      </form>
      <Box>
        {!!events && (
          <pre style={{
            maxWidth: '500px',
            overflow: 'auto'
          }}>{events}</pre>
        )}
      </Box>
    </Box>
  )
}