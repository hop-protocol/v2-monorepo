import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import _Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableFooter from '@mui/material/TableFooter'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'

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
  showNextButton: boolean
  showPreviousButton: boolean
  nextPage: any
  previousPage: any
  limit: number
}

export function Table (props: Props) {
  const { title, headers, rows, showNextButton, showPreviousButton, nextPage, previousPage, limit } = props
  const page = 0
  function handleChangePage() {
  }
  function handleChangeRowsPerPage () {
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box width="100%" minWidth="400px" mr={4}>
          <TableContainer>
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
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={100}>
                    <Box width="100%" display="flex" justifyContent="flex-end">
                        <IconButton
                          onClick={previousPage}
                          disabled={!showPreviousButton}
                          aria-label="previous page"
                        >
                        <KeyboardArrowLeft />
                      </IconButton>
                        <IconButton
                          onClick={nextPage}
                          disabled={!showNextButton}
                          aria-label="next page"
                        >
                        <KeyboardArrowRight />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </_Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  )
}
