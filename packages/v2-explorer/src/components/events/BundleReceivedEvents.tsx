import React from 'react'
import { Table } from '../Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../../hooks/useEvents'

export function BundleReceivedEvents () {
  const eventName = 'BundleReceived'
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
      key: 'bundleFees',
      value: 'Bundle Fees',
    },
    {
      key: 'fromChainId',
      value: 'From Chain ID',
    },
    {
      key: 'toChainId',
      value: 'To Chain ID',
    },
    {
      key: 'relayWindowStart',
      value: 'Relay Window Start',
    },
    {
      key: 'relayer',
      value: 'Relayer',
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
        key: 'bundleFees',
        value: event.bundleFeesDisplay
      },
      {
        key: 'fromChainId',
        value: event.context.chainId
      },
      {
        key: 'toChainId',
        value: event.toChainId
      },
      {
        key: 'relayWindowStart',
        value: event.relayWindowStart
      },
      {
        key: 'Relayer',
        value: event.relayerTruncated
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
