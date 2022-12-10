import React, { useMemo, useState, useEffect, useCallback } from 'react'
import gnosisModule from '@web3-onboard/gnosis'
import { useInterval } from 'react-use'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import './App.css'
import { Contract, BigNumber, providers, constants } from 'ethers'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { useQueryParams } from './hooks/useQueryParams'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

const injected = injectedModule()
const gnosis = gnosisModule()

const onboard = Onboard({
  wallets: [injected, gnosis],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213'
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli',
      rpcUrl: 'https://goerli.infura.io/v3/84842078b09946638c03157f83405213'
    },
    {
      id: '0xA',
      token: 'ETH',
      label: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io'
    },
    {
      id: '0x1A4',
      token: 'ETH',
      label: 'Optimism Goerli',
      rpcUrl: 'https://goerli.optimism.io'
    }
  ]
})

function App () {
  // const { sdk, connected, safe } = useSafeAppsSDK()
  const { queryParams, updateQueryParams } = useQueryParams()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('-')
  const [onboardWallet, setOnboardWallet] = useState<any>()
  const [wallet, setWallet] = useState<any>()

  async function onboardConnect() {
    const wallets = await onboard.connectWallet()
    if (wallets[0]) {
      setOnboardWallet(wallets[0])
      const ethersProvider = new providers.Web3Provider(
        wallets[0].provider,
        'any'
      )
      const signer = ethersProvider.getSigner()
      setWallet(signer)
    } else {
      setOnboardWallet(null)
    }
  }

  const [provider] = useState(() => {
    try {
      return new providers.Web3Provider((window as any).ethereum)
    } catch (err: any) {
      setError(err.message)
    }
  })

  const updateBalance = async () => {
    try {
      if (!provider) {
        return
      }
      if (!address) {
        return
      }
      const _balance = await provider.getBalance(address)
      setBalance(formatEther(_balance.toString()))
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const updateBalanceCb = useCallback(updateBalance, [updateBalance])

  useEffect(() => {
    if (address) {
      updateBalanceCb().catch(console.error)
    }
  }, [address, updateBalanceCb])

  useInterval(updateBalance, 5 * 1000)

  const getWalletAddress = async () => {
    try {
      if (wallet) {
        const _address = await wallet.getAddress()
        setAddress(_address)
      } else {
        setAddress('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getWalletAddress().catch(console.error)
  }, [wallet])

  useInterval(getWalletAddress, 5 * 1000)

  async function connect () {
    try {
      setError('')
      if (!provider) {
        return
      }
      await onboardConnect()
      /*
      try {
        await provider.send('eth_requestAccounts', [])
      } catch (err) {
        console.error(err)
      }
      try {
        await (window as any).ethereum.enable()
      } catch (err) {
        console.error(err)
      }
      */
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function disconnect () {
    try {
      await onboard.disconnectWallet(onboardWallet)
      localStorage.clear()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box width="400px" p={4} m="0 auto" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box mb={4}>
        <Typography variant="h4">
          Hop v2 SDK Demo
        </Typography>
      </Box>
      <Box mb={4} display="flex" flexDirection="column">
        {!!address && (
            <Box mb={2} display="flex">
              <Typography variant="body2">
                account address: {address}
              </Typography>
            </Box>
        )}
        {!!address && (
          <Box mb={2}>
            <Typography variant="body2">
              account balance: <span>{balance} ETH</span>
            </Typography>
          </Box>
        )}
        {!address && (
          <Box mb={4}>
            <Button onClick={connect} variant="contained">Connect</Button>
          </Box>
        )}
        {!!address && (
          <Box mb={4}>
            <Box mb={2}>
              <Button onClick={disconnect}>disconnect</Button>
            </Box>
          </Box>
        )}
      </Box>
      {!!error && (
        <Box mb={4} style={{ maxWidth: '400px', wordBreak: 'break-word' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {!!success && (
        <Box mb={4}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}
      <Box>
        <a href="https://github.com/hop-protocol/v2-monorepo" target="_blank" rel="noopener noreferrer">Github</a>
      </Box>
    </Box>
  )
}

export default App
