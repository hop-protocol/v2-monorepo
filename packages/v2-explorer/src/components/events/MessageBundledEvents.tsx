import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function MessageBundledEvents () {
  const eventName = 'MessageBundled'
  const { events, nextPage, showNextButton } = useEvents(eventName)

  const data = events.map((event: any) => {
    return [
      {
        label: 'Timestamp',
        value: event.context.blockTimestamp
      },
      {
        label: 'Bundle ID',
        value: event.bundleId
      },
      {
        label: 'Tree Index',
        value: event.treeIndex
      },
      {
        label: 'Message ID',
        value: event.messageId
      },
      {
        label: 'From Chain ID',
        value: event.context.chainId
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
