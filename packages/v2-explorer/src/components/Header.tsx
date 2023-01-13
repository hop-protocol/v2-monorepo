import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useHistory, useLocation } from 'react-router-dom'

export function Header () {
  const history = useHistory()
  const location = useLocation()

  const currentTab = useMemo(() => {
    const routes: any = {
      '/': 'home',
      '/events': 'events'
    }

    return routes[location.pathname]
  }, [])

  function handleTabChange (event: any, newValue: number) {
    const routes: any = {
      home: '/',
      events: '/events'
    }
    history.push(routes[newValue])
  }

  return (
    <Box width="100%" mb={4} display="flex" justifyContent="space-between">
      <Box display="flex">
        <Box display="flex" justifyItems="center" alignItems="center">
          <Box>
            <Typography variant="h4">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box mr={1}><img width="32px" src="https://assets.hop.exchange/images/hop_logo.png" style={{ borderRadius: '50%' }}/></Box><Box>Hop v2 Explorer</Box>
              </Box>
            </Typography>
          </Box>
          <Box ml={2}>
            <Typography variant="subtitle1">
              Goerli
            </Typography>
          </Box>
        </Box>
        <Box ml={4}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Home" value="home" />
            <Tab label="Events" value="events" />
          </Tabs>
        </Box>
      </Box>
    </Box>
  )
}
