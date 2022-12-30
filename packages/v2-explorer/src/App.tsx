import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import './App.css'
// import { useQueryParams } from './hooks/useQueryParams'
import { Table } from './components/Table'
import Card from '@mui/material/Card'

function App () {
  // const { queryParams, updateQueryParams } = useQueryParams()
  const [events, setEvents] = useState([])
  const [lastKey, setLastKey] = useState('')
  const limit = 10

  const updateEvents = async (_lastKey: string = '') => {
    try {
      const url = `http://localhost:8000/v1/events?limit=${limit}&lastKey=${_lastKey}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.error) {
        throw new Error(json.error)
      }
      if (!json.events) {
        throw new Error('no events')
      }
      setEvents(json.events)
      setLastKey(json.lastKey ?? '')
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const updateEventsCb = useCallback(updateEvents, [])

  useEffect(() => {
    updateEventsCb().catch(console.error)
  }, [updateEventsCb])

  useInterval(updateEvents, 10 * 1000)

  const data = events.map((event: any) => {
    return [
      {
        label: 'Timestamp',
        value: event.context.blockTimestamp
      },
      {
        label: 'Message ID',
        value: event.messageId
      },
      {
        label: 'From Chain ID',
        value: event.context.chainId
      },
      {
        label: 'To Chain ID',
        value: event.toChainId
      }
    ]
  })

  function nextPage(event: any) {
    event.preventDefault()
    updateEventsCb(lastKey)
  }

  return (
    <Box p={4} m="0 auto" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box width="100%" mb={4} display="flex" justifyContent="space-between">
        <Box display="flex" justifyItems="center" alignItems="center">
          <Box>
            <Typography variant="h4">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box mr={1}><img width="32px" src="https://assets.hop.exchange/images/hop_logo.png" style={{ borderRadius: '50%' }}/></Box><Box>Hop v2 Explorer</Box>
              </Box>
            </Typography>
          </Box>
          <Box ml={2}>
            <Typography variant="subtitle1">
              Goerli
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box width="100%" mb={6} display="flex" flexDirection="column">
        <Box mb={8}>
          <Box maxWidth="1400px" m="0 auto">
            <Card>
              <Box p={4} minWidth="400px">
                <Table title="SendMessage Events" rows={data} />
                {events.length === limit && <Button onClick={nextPage}>Next Page</Button>}
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
      <Box mb={4}>
        <a href="https://github.com/hop-protocol/v2-monorepo" target="_blank" rel="noopener noreferrer" style={{ color: '#c34be4' }}>Github</a>
      </Box>
    </Box>
  )
}

export default App
