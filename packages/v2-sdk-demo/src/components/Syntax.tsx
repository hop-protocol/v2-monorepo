import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow as theme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Box from '@mui/material/Box'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Typography from '@mui/material/Typography'

export function Syntax (props: { code: string }) {
  const { code } = props
  const [copied, setCopied] = useState(false)

  function handleCopy () {
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <SyntaxHighlighter
          language="javascript"
          style={theme}
          showLineNumbers={true}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <CopyToClipboard text={code}
          onCopy={handleCopy}>
          <Typography variant="body2" style={{ cursor: 'pointer' }}>
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </Typography>
        </CopyToClipboard>
      </Box>
    </Box>
  )
}
