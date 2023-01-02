import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function BundleCommittedEvents () {
  const eventName = 'BundleCommitted'
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
        label: 'Bundle Root',
        value: event.bundleRoot
      },
      {
        label: 'Bundle Fees',
        value: event.bundleFees
      },
      {
        label: 'To Chain ID',
        value: event.toChainId
      },
      {
        label: 'Commit Time',
        value: event.commitTime
      }
    ]
  })

  return (
    <Box>
      <Table title={`${eventName} Events`} rows={data} />
      {showNextButton && <Button onClick={nextPage}>Next Page</Button>}
    </Box>
  )
}
