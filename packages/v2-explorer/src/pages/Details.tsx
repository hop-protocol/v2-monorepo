import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { SiteWrapper } from '../components/SiteWrapper'
// import { ExplorerEvents } from '../components/ExplorerEvents'
import { useHistory, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function Details () {
  const location = useLocation()
  const parts = location.pathname.split('/')
  const messageId = parts[2]

  return (
    <SiteWrapper>
      <Box>
        Message details
      </Box>

      <Box>
        Message ID: {messageId}
      </Box>
    </SiteWrapper>
  )
}
