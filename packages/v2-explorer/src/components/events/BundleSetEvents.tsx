import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function BundleSetEvents () {
  const eventName = 'BundleSet'
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
      key: 'bundleRoot',
      value: 'Bundle Root',
    },
    {
      key: 'fromChainId',
      value: 'From Chain ID',
    }
  ]

  const rows = events.map((event: any) => {
    return [
      {
        key: 'timestamp',
        value: `${event.context.blockTimestamp} (${event.context.blockTimestampRelative})`
      },
      {
        key: 'bundleId',
        value: event.bundleIdTruncated
      },
      {
        key: 'bundleRoot',
        value: event.bundleRootTruncated
      },
      {
        key: 'fromChainID',
        value: event.fromChainId
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
