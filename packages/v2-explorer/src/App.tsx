import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import './App.css'
// import { useQueryParams } from './hooks/useQueryParams'
import { Table } from './components/Table'
import Card from '@mui/material/Card'
import { apiUrl } from './config'
import { BundleCommittedEvents } from './components/events/BundleCommittedEvents'
import { BundleForwardedEvents } from './components/events/BundleForwardedEvents'
import { BundleReceivedEvents } from './components/events/BundleReceivedEvents'
import { BundleSetEvents } from './components/events/BundleSetEvents'
import { MessageBundledEvents } from './components/events/MessageBundledEvents'
import { MessageRelayedEvents } from './components/events/MessageRelayedEvents'
import { MessageRevertedEvents } from './components/events/MessageRevertedEvents'
import { MessageSentEvents } from './components/events/MessageSentEvents'

function App () {
  // const { queryParams, updateQueryParams } = useQueryParams()

  const tables = [
    <BundleCommittedEvents />,
    <BundleForwardedEvents />,
    <BundleReceivedEvents />,
    <BundleSetEvents />,
    <MessageBundledEvents />,
    <MessageRelayedEvents />,
    <MessageRevertedEvents />,
    <MessageSentEvents />
  ]

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
            {tables.map((table, i) => {
              return (
                <Box key={i} mb={8}>
                  {table}
                </Box>
              )
            })}
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
