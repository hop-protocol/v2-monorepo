import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import _Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

export type Header = {
  key: string
  value: string
}

export type Row = {
  key: string
  value: string
}

type Props = {
  title: string
  headers: Header[]
  rows: Row[][]
}

export function Table (props: Props) {
  const { title, headers, rows } = props

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box width="100%" minWidth="400px" mr={4}>
          <_Table width="100%">
            <TableHead>
              <TableRow>
                {headers.map((header: Header, i: number) => {
                  return (
                    <TableCell key={i}>{header.value}</TableCell>
                  )
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: Row[], i: number) => {
                return (
                  <TableRow key={i}>
                    {row.map((col: Row, j: number) => {
                      return (
                        <TableCell key={j}>{col.value}</TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </_Table>
        </Box>
      </Box>
    </Box>
  )
}
