import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function MessageBundledEvents () {
  const eventName = 'MessageBundled'
  const { events, nextPage, previousPage, showNextButton, showPreviousButton, limit, loading } = useEvents(eventName)

  const headers = [
    {
      key: 'timestamp',
      value: 'Timestamp',
    },
    {
      key: 'bundleId',
      value: 'Bundle ID',
    },
    {
      key: 'treeIndex',
      value: 'Tree Index',
    },
    {
      key: 'messageId',
      value: 'Message ID',
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
        key: 'bundleID',
        value: event.bundleIdTruncated
      },
      {
        key: 'treeIndex',
        value: event.treeIndex
      },
      {
        key: 'messageId',
        value: event.messageIdTruncated
      },
      {
        key: 'eventChainId',
        value: event.context.chainId
      },
    ]
  })

  return (
    <Box>
      <Table title={`${eventName} Events`} headers={headers} rows={rows} showNextButton={showNextButton} showPreviousButton={showPreviousButton} nextPage={nextPage} previousPage={previousPage} limit={limit} loading={loading} />
    </Box>
  )
}
