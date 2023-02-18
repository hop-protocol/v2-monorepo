import React from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { MenuItemIcon } from './MenuItemIcon'
import { chains as coreChains } from '@hop-protocol/core/metadata'

export type Chain = {
  chainId: string
}

export type Props = {
  value: string
  chains: string[]
  onChange: (chainId: string) => void
}

const chainSlugs: any = {
  1: 'ethereum',
  10: 'optimism',
  420: 'optimism',
  5: 'ethereum',
}

const labels: Record<string, string> = {
  1: 'Ethereum (Mainnet)',
  10: 'Optimism (Mainnet)',
  420: 'Optimism (Goerli)',
  5: 'Ethereum (Goerli)',
}

export function ChainSelect(props: Props) {
  const { value, chains, onChange } = props

  function handleChange (event: any) {
    onChange(event.target.value)
  }

  return (
    <Select
      fullWidth
      value={value}
      onChange={handleChange}>
      {chains.map((chainId: string, i: number) => (
        <MenuItem key={i} value={chainId}>
          <MenuItemIcon src={(coreChains as any)[chainSlugs[chainId]]?.image} />
          {chainId} - {labels[chainId]}
        </MenuItem>
      ))}
    </Select>
  )
}
