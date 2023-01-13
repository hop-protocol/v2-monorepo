import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { SiteWrapper } from '../components/SiteWrapper'
// import { ExplorerEvents } from '../components/ExplorerEvents'
import { useHistory, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEvents } from '../hooks/useEvents'
import Chip from '@mui/material/Chip'
import CheckIcon from '@mui/icons-material/Check'
import PendingIcon from '@mui/icons-material/Pending'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableFooter from '@mui/material/TableFooter'
import Skeleton from '@mui/material/Skeleton'
import Link from '@mui/material/Link'

export function Details () {
  const location = useLocation()
  const parts = location.pathname.split('/')
  const messageId = parts[2]

  const filter = { messageId: messageId }
  const { events, loading } = useEvents('explorer', filter)
  const event: any = events[0]

  let status :any = null
  const isRelayed = !!event?.messageRelayedEvent
  if (isRelayed) {
    status = (
      <Chip icon={<CheckIcon style={{ color: '#fff' }} />} label="Relayed" style={{ backgroundColor: '#74d56e', color: '#fff' }} />
    )
  } else if (event && !event?.messageRelayedEvent) {
    status = (
      <Chip icon={<PendingIcon />} label="Pending" />
    )
  }

  return (
    <SiteWrapper>
      <Box mb={4} width="100%" display="flex" justifyContent="flex-start">
        <Typography variant="h5">Message details</Typography>
      </Box>

      <TableContainer>
        <Table width="100%">
          <TableBody>
            <TableRow>
              <TableCell>Message ID</TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={500} height={20} />
                ) : (
                  messageId
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={200} height={20} />
                ) : (
                  status
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={500} height={20} />
                ) : (
                  <Box>{event?.context?.blockTimestamp} {event ? <>({event?.context?.blockTimestampRelative})</> : null}</Box>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
        Source Chain
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={350} height={20} />
                ) : (
                  event?.context?.chainLabel
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
Source Block Number
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={200} height={20} />
                ) : (
                  event?.context?.blockNumber
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
Source Transaction Hash
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={500} height={20} />
                ) : (
                <Link href={event?.context?.transactionHashExplorerUrl} target="_blank" rel="noreferrer">
                  {event?.context?.transactionHash}
                </Link>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
Destination Chain
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={350} height={20} />
                ) : (
event?.toChainLabel
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
Destination Transaction Hash
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={500} height={20} />
                ) : (
                  event?.messageRelayedEvent
                  ? (
                    <Link href={event?.messageRelayedEvent?.context?.transactionHashExplorerUrl} target="_blank" rel="noreferrer">
                      {event?.messageRelayedEvent?.context?.transactionHash}
                    </Link>
                  ) : '-')
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
          Destination address specified
              </TableCell>
              <TableCell>
                {loading
                ? (
                  <Skeleton variant="rectangular" width={500} height={20} />
                ) : (
                  event?.to
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </SiteWrapper>
  )
}
