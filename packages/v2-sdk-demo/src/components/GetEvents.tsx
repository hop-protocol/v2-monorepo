import React, { useState, useEffect, useMemo } from 'react'
import { Signer } from 'ethers'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { Hop } from '@hop-protocol/v2-sdk'
import { Syntax } from './Syntax'

type Props = {
  sdk: Hop
}

export function GetEvents (props: Props) {
  const { sdk } = props
  const [chainId, setChainId] = useState(() => {
    try {
      const cached = localStorage.getItem('getEvents:chainId')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return '420'
  })
  const [startBlock, setStartBlock] = useState(() => {
    try {
      const cached = localStorage.getItem('getEvents:startBlock')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [endBlock, setEndBlock] = useState(() => {
    try {
      const cached = localStorage.getItem('getEvents:endBlock')
      if (cached) {
        return cached
      }
    } catch (err: any) {}
    return ''
  })
  const [events, setEvents] = useState('')
  const [loading, setLoading] = useState(false)
  const eventNames = useMemo(() => {
    return sdk?.getEventNames() ?? []
  }, [sdk])
  const [selectedEventNames, setSelectedEventNames] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('getEvents:selectedEventNames')
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (err: any) {}
    return [eventNames[0]]
  })
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('getEvents:selectedEventNames', JSON.stringify(selectedEventNames))
    } catch (err: any) {
      console.error(err)
    }
  }, [selectedEventNames])

  useEffect(() => {
    try {
      localStorage.setItem('getEvents:chainId', chainId)
    } catch (err: any) {
      console.error(err)
    }
  }, [chainId])

  useEffect(() => {
    try {
      localStorage.setItem('getEvents:startBlock', startBlock)
    } catch (err: any) {
      console.error(err)
    }
  }, [startBlock])

  useEffect(() => {
    try {
      localStorage.setItem('getEvents:endBlock', endBlock)
    } catch (err: any) {
      console.error(err)
    }
  }, [endBlock])

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
      setError('')
      setEvents('')
      setLoading(true)
      const _events = await getEvents()
      setEvents(JSON.stringify(_events, null, 2))
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  const code = `
import { Hop } from '@hop-protocol/v2-sdk'

async function main() {
  const eventNames = ${JSON.stringify(selectedEventNames)}
  const chainId = ${chainId || 'undefined'}
  const startBlock = ${startBlock || 'undefined'}
  const endBlock = ${endBlock || 'undefined'}

  const hop = new Hop('goerli')
  const events = await hop.getEvents(eventNames, chainId, startBlock, endBlock)
  console.log(events)
}

main().catch(console.error)
`.trim()

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5">Get Events</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box minWidth="400px" mr={4}>
          <Box>
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
          </Box>
          {!!error && (
            <Box mb={4} width="100%" style={{ wordBreak: 'break-word' }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          {!!events && (
            <Box>
              <pre style={{
                maxWidth: '500px',
                overflow: 'auto'
              }}>{events}</pre>
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
