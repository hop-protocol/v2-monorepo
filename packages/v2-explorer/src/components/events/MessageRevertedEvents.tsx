import React, { useState } from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export function MessageRevertedEvents () {
  const eventName = 'MessageReverted'
  const [filterBy, setFilterBy] = useState('messageId')
  const [filterValue, setFilterValue] = useState('')
  const filter = { [filterBy]: filterValue }
  const { events, nextPage, previousPage, showNextButton, showPreviousButton, limit, loading } = useEvents(eventName, filter)

  const headers = [
    {
      key: 'timestamp',
      value: 'Timestamp',
    },
    {
      key: 'transactionHash',
      value: 'Transaction Hash'
    },
    {
      key: 'messageId',
      value: 'Message ID',
    },
    {
      key: 'fromChainId',
      value: 'From Chain ID',
    },
    {
      key: 'from',
      value: 'From',
    },
    {
      key: 'to',
      value: 'To',
    },
    {
      key: 'eventChainId',
      value: 'Event Chain ID',
    },
  ]

  const rows = events.map((event: any) => {
    return [
      {
        key: 'timestamp',
        value: `${event.context.blockTimestamp} (${event.context.blockTimestampRelative})`
      },
      {
        key: 'transactionHash',
        value: event.context.transactionHashTruncated,
        clipboardValue: event.context.transactionHash
      },
      {
        key: 'messageId',
        value: event.messageIdTruncated,
        clipboardValue: event.messageId
      },
      {
        key: 'fromChainId',
        value: event.fromChainId
      },
      {
        key: 'from',
        value: event.fromTruncated,
        clipboardValue: event.from
      },
      {
        key: 'To',
        value: event.toTruncated,
        clipboardValue: event.to
      },
      {
        key: 'eventChainId',
        value: event.context.chainId
      },
    ]
  })

  function handleFilterByChange (event: any) {
    setFilterBy(event.target.value)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Box mr={2}>
          <Typography variant="body1">Filter</Typography>
        </Box>
        <Box mr={2}>
          <Select
            value={filterBy}
            onChange={handleFilterByChange}>
              <MenuItem value={'messageId'}>Message ID</MenuItem>
              <MenuItem value={'transactionHash'}>Transaction Hash</MenuItem>
          </Select>
        </Box>
        <Box>
          <TextField value={filterValue} onChange={(event: any) => setFilterValue(event.target.value)} />
        </Box>
      </Box>
      <Table title={`${eventName} Events`} headers={headers} rows={rows} showNextButton={showNextButton} showPreviousButton={showPreviousButton} nextPage={nextPage} previousPage={previousPage} limit={limit} loading={loading} />
    </Box>
  )
}
