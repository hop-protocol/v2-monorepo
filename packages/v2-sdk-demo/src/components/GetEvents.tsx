import React, { useState, useMemo } from 'react'
import { Signer } from 'ethers'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
  const eventNames = useMemo(() => {
    return sdk?.getEventNames() ?? []
  }, [sdk])
  const [selectedEventName, setSelectedEventName] = useState(eventNames[0] || '')

  async function getEvents() {
    if (!signer?.provider) {
      return []
    }
    const latestBlock = await signer.provider.getBlockNumber()
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
      selectedEventName,
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
      const _events = await getEvents()
      setEvents(JSON.stringify(_events, null, 2))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Typography variant="h5">Get Events</Typography>
      <form onSubmit={handleSubmit}>
        <Box>
          <Box>
            <label>Event name</label>
          </Box>
          <select onChange={event => setSelectedEventName(event.target.value)}>
            {eventNames.map((eventName: string) => {
              return (
                <option key={eventName} value={eventName}>{eventName}</option>
              )
            })}
          </select>
        </Box>
        <Box>
          <Box>
            <label>Chain ID</label>
          </Box>
          <TextField placeholder="420" value={chainId} onChange={event => setChainId(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>Start block</label>
          </Box>
          <TextField placeholder="0" value={startBlock} onChange={event => setStartBlock(event.target.value)} />
        </Box>
        <Box>
          <Box>
            <label>End block</label>
          </Box>
          <TextField placeholder="0" value={endBlock} onChange={event => setEndBlock(event.target.value)} />
        </Box>
        <Button type="submit">Get events</Button>
      </form>
      <Box>
        <Box>
          <pre style={{
            maxWidth: '500px',
            overflow: 'auto'
          }}>{events}</pre>
        </Box>
      </Box>
    </Box>
  )
}
