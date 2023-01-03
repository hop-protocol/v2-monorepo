import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function MessageBundledEvents () {
  const eventName = 'MessageBundled'
  const { events, nextPage, showNextButton } = useEvents(eventName)

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
      key: 'fromChainId',
      value: 'fromChainId',
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
        key: 'fromChainId',
        value: event.context.chainId
      },
    ]
  })

  return (
    <Box>
      <Table title={`${eventName} Events`} headers={headers} rows={rows} />
      {showNextButton && <Button onClick={nextPage}>Next Page</Button>}
    </Box>
  )
}
