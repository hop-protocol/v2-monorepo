import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'

export function Footer () {
  return (
    <Box mb={4}>
      <a href="https://github.com/hop-protocol/v2-monorepo" target="_blank" rel="noopener noreferrer" style={{ color: '#c34be4' }}>Github</a>
    </Box>
  )
}
