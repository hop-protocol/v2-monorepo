import React from 'react'
import Box from '@mui/material/Box'

type Props = {
  src?: string
}

export function MenuItemIcon (props: Props) {
  const { src } = props
  return (
    <Box mr={1} display="inline-flex" alignItems="center" justifyContent="center">
      {src ? (
        <img src={src} alt="" width="16px" />
      ) : (
        null
      )}
    </Box>
  )
}
