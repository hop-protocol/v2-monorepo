import React, { useMemo, useState, useEffect, useCallback } from 'react'
// import gnosisModule from '@web3-onboard/gnosis'
import { useInterval } from 'react-use'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import './App.css'
import { providers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useQueryParams } from './hooks/useQueryParams'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { SendMessage } from './components/SendMessage'
import { RelayBundle } from './components/RelayBundle'
import { GetEvents } from './components/GetEvents'
import { Hop } from '@hop-protocol/v2-sdk'
import Card from '@mui/material/Card'

const Buffer = require('buffer/').Buffer

const injected = injectedModule()
// const gnosis = gnosisModule()

const onboard = Onboard({
  wallets: [injected],
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

if (!(window as any).Buffer) {
  ;(window as any).Buffer = Buffer
  ;(window as any).onboard = onboard
}

function App () {
  // const { sdk, connected, safe } = useSafeAppsSDK()
  const { queryParams, updateQueryParams } = useQueryParams()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('-')
  const [onboardWallet, setOnboardWallet] = useState<any>()
  const [wallet, setWallet] = useState<any>()
  const sdk = useMemo(() => {
    /*
    const contractAddresses = {
      ethereum: {
        startBlock: 8077320,
        hubCoreMessenger: '0x9827315F7D2B1AAd0aa4705c06dafEE6cAEBF920',
        ethFeeDistributor: '0x8fF09Ff3C87085Fe4607F2eE7514579FE50944C5'
      },
      optimism: {
        startBlock: 3218800,
        spokeCoreMessenger: '0x4b844c25ef430e71d42eea89d87ffe929f8db927',
        connector: '0x342EA1227fC0e085704D30cd17a16cA98B58D08B'
      }
    }
    */

    const _sdk = new Hop('goerli', {
     // contractAddresses
    })
    ;(window as any).sdk = _sdk
    return _sdk
  }, [])

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

  const showAccountInfo = false

  return (
    <Box p={4} m="0 auto" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box width="100%" mb={4} display="flex" justifyContent="space-between">
        <Box display="flex" justifyItems="center" alignItems="center">
          <Box>
            <Typography variant="h4">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box mr={1}><img width="32px" src="https://assets.hop.exchange/images/hop_logo.png" style={{ borderRadius: '50%' }}/></Box><Box>Hop v2 SDK Playground</Box>
              </Box>
            </Typography>
          </Box>
          <Box ml={2}>
            <Typography variant="subtitle1">
              Goerli
            </Typography>
          </Box>
        </Box>
        <Box>
          {!address && (
            <Box>
              <Button onClick={connect} variant="contained">Connect</Button>
            </Box>
          )}
          {!!address && (
            <Box>
              <Button onClick={disconnect}>disconnect</Button>
            </Box>
          )}
        </Box>
      </Box>
      {showAccountInfo && (
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
        </Box>
      )}
      <Box width="100%" mb={6} display="flex" flexDirection="column">
        <Box mb={8}>
          <Box maxWidth="1400px" m="0 auto">
            <Card>
              <Box p={4} minWidth="400px">
                <SendMessage signer={wallet} sdk={sdk} onboard={onboard} />
              </Box>
            </Card>
          </Box>
        </Box>
        <Box mb={8}>
          <Box maxWidth="1400px" m="0 auto">
            <Card>
              <Box p={4} minWidth="400px">
                <RelayBundle signer={wallet} sdk={sdk} onboard={onboard} />
              </Box>
            </Card>
          </Box>
        </Box>
        <Box mb={8}>
          <Box maxWidth="1400px" m="0 auto">
            <Card>
              <Box p={4} minWidth="400px">
                <GetEvents sdk={sdk} />
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
      <Box mb={4}>
        <a href="https://github.com/hop-protocol/v2-monorepo" target="_blank" rel="noopener noreferrer" style={{ color: '#c34be4' }}>Github</a>
      </Box>
    </Box>
  )
}

export default App
