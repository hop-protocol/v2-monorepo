import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function MessageSentEvents () {
  const eventName = 'MessageSent'
  const { events, nextPage, showNextButton } = useEvents(eventName)

  const headers = [
    {
      key: 'timestamp',
      value: 'Timestamp',
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
      key: 'toChainId',
      value: 'To Chain ID',
    }
  ]

  const rows = events.map((event: any) => {
    return [
      {
        key: 'timestamp',
        value: `${event.context.blockTimestamp} (${event.context.blockTimestampRelative})`
      },
      {
        key: 'messageId',
        value: event.messageIdTruncated
      },
      {
        key: 'fromChainId',
        value: event.context.chainId
      },
      {
        key: 'toChainID',
        value: event.toChainId
      }
    ]
  })

  return (
    <Box>
      <Table title={`${eventName} Events`} headers={headers} rows={rows} />
      {showNextButton && <Button onClick={nextPage}>Next Page</Button>}
    </Box>
  )
}
