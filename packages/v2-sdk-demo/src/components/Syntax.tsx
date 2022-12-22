import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow as theme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Box from '@mui/material/Box'

export function Syntax (props: { code: string }) {
  const { code } = props
  return (
    <Box>
      <SyntaxHighlighter
        language="javascript"
        style={theme}
        showLineNumbers={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  )
}
