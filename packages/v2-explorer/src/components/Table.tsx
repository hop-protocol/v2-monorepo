import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type Row = {
  label: string
  value: string
}

type Props = {
  title: string
  rows: Row[][]
}

export function Table (props: Props) {
  const { title, rows } = props

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box minWidth="400px" mr={4}>
          <table>
            <tbody>
              {rows.map((row: Row[], i: number) => {
                return (
                  <tr key={i}>
                    {row.map((col: Row, j: number) => {
                      return (
                        <td key={j}>{col.value}</td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  )
}
