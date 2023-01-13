import React, { useState } from 'react'
import { Table } from './Table'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEvents } from '../hooks/useEvents'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CheckIcon from '@mui/icons-material/Check'
import PendingIcon from '@mui/icons-material/Pending'
import { useHistory, useLocation } from 'react-router-dom'

export function ExplorerEvents () {
  const history = useHistory()
  const [filterBy, setFilterBy] = useState('messageId')
  const [filterValue, setFilterValue] = useState('')
  const filter = { [filterBy]: filterValue }
  const { events, nextPage, previousPage, showNextButton, showPreviousButton, limit, loading } = useEvents('explorer', filter)

  const headers = [
    {
      key: 'status',
      value: 'Status',
    },
    {
      key: 'created',
      value: 'Created',
    },
    {
      key: 'messageId',
      value: 'Message ID',
    },
    {
      key: 'sourceChain',
      value: 'Source Chain',
    },
    {
      key: 'sourceTransactionHash',
      value: 'Source Transaction Hash'
    },
    {
      key: 'destinationChain',
      value: 'Destination Chain',
    },
    {
      key: 'destinationTransactionHash',
      value: 'Destination Transaction Hash'
    },
  ]

  const rows = events.map((event: any) => {
    let status = (
      <Chip icon={<PendingIcon />} label="Pending" />
    )
    if (event.messageRelayedEvent) {
      status = (
        <Chip icon={<CheckIcon style={{ color: '#fff' }} />} label="Relayed" style={{ backgroundColor: '#74d56e', color: '#fff' }} />
      )
    }
    return [
      {
        key: 'status',
        value: status
      },
      {
        key: 'created',
        value: `(${event.context.blockTimestampRelative})`
      },
      {
        key: 'messageId',
        value: event.messageIdTruncated,
        clipboardValue: event.messageId
      },
      {
        key: 'sourceChain',
        value: event.context.chainLabel
      },
      {
        key: 'sourceTransactionHash',
        value: event.context.transactionHashTruncated,
        valueUrl: event.context.transactionHashExplorerUrl,
        clipboardValue: event.context.transactionHash
      },
      {
        key: 'destinationChain',
        value: event.toChainLabel
      },
      {
        key: 'destinationTransactionHash',
        value: event.messageRelayedEvent?.context?.transactionHashTruncated,
        valueUrl: event.messageRelayedEvent?.context?.transactionHashExplorerUrl,
        clipboardValue: event.messageRelayedEvent?.context?.transactionHash
      },
    ]
  })

  function handleRowClick (row: any) {
    const messageId = row.find((item: any) => item.key === 'messageId').clipboardValue
    history.push(`/m/${messageId}`)
  }

  return (
    <Box>
      <Table title={'Messages'} headers={headers} rows={rows} showNextButton={showNextButton} showPreviousButton={showPreviousButton} nextPage={nextPage} previousPage={previousPage} limit={limit} loading={loading} onRowClick={handleRowClick} />
    </Box>
  )
}
