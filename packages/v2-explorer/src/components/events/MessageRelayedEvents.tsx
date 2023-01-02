import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function MessageRelayedEvents () {
  const eventName = 'MessageRelayed'
  const { events, nextPage, showNextButton } = useEvents(eventName)

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
        value: event.fromChainId
      },
      {
        label: 'From',
        value: event.from
      },
      {
        label: 'From',
        value: event.to
      },
    ]
  })

  return (
    <Box>
      <Table title={`${eventName} Events`} rows={data} />
      {showNextButton && <Button onClick={nextPage}>Next Page</Button>}
    </Box>
  )
}
