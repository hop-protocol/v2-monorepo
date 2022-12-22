import React, { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Hop } from '@hop-protocol/v2-sdk'
import { Syntax } from './Syntax'

type Props = {
  sdk: Hop
}

export function GetContractAddresses (props: Props) {
  const { sdk } = props
  const contractAddresses = useMemo(() => {
    return sdk?.getContractAddresses() ?? null
  }, [sdk])

  const code = `
import { Hop } from '@hop-protocol/v2-sdk'

async function main() {
  const hop = new Hop('goerli')
  const contractAddresses = await hop.getContractAddresses()
  console.log(contractAddresses)
}

main().catch(console.error)
`.trim()

  return (
    <Box>
      <Box mb={1}>
        <Typography variant="h5">Get Contract Addresses</Typography>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle1">Get hub and spoke contract addresses used</Typography>
      </Box>
      <Box width="100%" display="flex" justifyContent="space-between">
        <Box minWidth="400px" mr={4}>
          {!!contractAddresses && (
            <Box>
              <Box mb={2}>
                <Typography variant="body1">Output</Typography>
              </Box>
              <pre style={{
                maxWidth: '500px',
                overflow: 'auto'
              }}>{JSON.stringify(contractAddresses, null, 2)}</pre>
            </Box>
          )}
        </Box>
        <Box width="100%">
          <Box mb={2}>
            <Typography variant="subtitle1">Code example</Typography>
          </Box>
          <Box>
            <Syntax code={code} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
