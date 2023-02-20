import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { SiteWrapper } from '../components/SiteWrapper'
// import gnosisModule from '@web3-onboard/gnosis'
import { useInterval } from 'react-use'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { providers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useQueryParams } from '../hooks/useQueryParams'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { SendMessage } from '../components/SendMessage'
import { RelayMessage } from '../components/RelayMessage'
import { ExitBundle } from '../components/ExitBundle'
import { GetBundleProof } from '../components/GetBundleProof'
import { GetEvents } from '../components/GetEvents'
import { GetMessageIdFromTxHash } from '../components/GetMessageIdFromTxHash'
import { GetMessageCalldata } from '../components/GetMessageCalldata'
import { GetContractAddresses } from '../components/GetContractAddresses'
import { SetContractAddresses } from '../components/SetContractAddresses'
import { GetMessageSentEvent } from '../components/GetMessageSentEvent'
import { GetMessageFee } from '../components/GetMessageFee'
import { SetRpcProviders } from '../components/SetRpcProviders'
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

export function Main () {
  // const { sdk, connected, safe } = useSafeAppsSDK()
  const { queryParams, updateQueryParams } = useQueryParams()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('-')
  const [onboardWallet, setOnboardWallet] = useState<any>()
  const [wallet, setWallet] = useState<any>()
  const [sdk, setSdk] = useState(() => {
    return new Hop('goerli')
  })

  useEffect(() => {
    ;(window as any).sdk = sdk
  }, [sdk])

  async function onboardConnect() {
    const wallets = await onboard.connectWallet()
    const _wallet = wallets[0]
    if (_wallet) {
      setOnboardWallet(_wallet)
    } else {
      setOnboardWallet(null)
    }
  }

  useEffect(() => {
    if (onboardWallet) {
      const ethersProvider = new providers.Web3Provider(
        onboardWallet.provider,
        'any'
      )
      const signer = ethersProvider.getSigner()
      setWallet(signer)
    } else {
      setWallet(null)
    }
  }, [onboardWallet])

  useEffect(() => {
    let unsubscribe: any
    try {
      const walletsSub = onboard.state.select('wallets')
      ;({ unsubscribe } = walletsSub.subscribe(wallets => {
        const connectedWallets = wallets.map(({ label }) => label)
        localStorage.setItem(
          'connectedWallets',
          JSON.stringify(connectedWallets)
        )
      }))
    } catch (err: any) {
      console.error(err)
    }

    return () => {
      if (unsubscribe) {
        // unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    async function update () {
      try {
        const cached = localStorage.getItem('connectedWallets')
        if (cached) {
          const previouslyConnectedWallets = JSON.parse(cached)

          if (previouslyConnectedWallets?.length > 0) {
            // You can also auto connect "silently" and disable all onboard modals to avoid them flashing on page load
            await onboard.connectWallet({
              autoSelect: { label: previouslyConnectedWallets[0], disableModals: true }
            })
          }
        }
      } catch (err: any) {
        console.error(err)
      }
    }

    update().catch(console.error)
  }, [])

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

  const components = [
    <SendMessage signer={wallet} sdk={sdk} onboard={onboard} />,
    <GetBundleProof sdk={sdk} />,
    <RelayMessage signer={wallet} sdk={sdk} onboard={onboard} />,
    <ExitBundle signer={wallet} sdk={sdk} onboard={onboard} />,
    <GetMessageIdFromTxHash sdk={sdk} />,
    <GetMessageCalldata sdk={sdk} />,
    <GetMessageSentEvent sdk={sdk} />,
    <GetEvents sdk={sdk} />,
    <GetMessageFee sdk={sdk} />,
    <SetContractAddresses sdk={sdk} />,
    <GetContractAddresses sdk={sdk} />,
    <SetRpcProviders sdk={sdk} />
  ]

  return (
    <SiteWrapper>
      <Box p={4} m="0 auto" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box width="100%" mb={4} display="flex" justifyContent="space-between">
          <Box display="flex">
            <Box>
              <Button variant="outlined" href="https://v2-explorer.hop.exchange/" target="_blank" rel="noopener noreferrer">
                View Explorer
              </Button>
            </Box>
            {!address && (
              <Box ml={4}>
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
          {components.map((component: any, i: number) => {
            return (
              <Box mb={8} key={i}>
                <Box maxWidth="1400px" m="0 auto">
                  <Card>
                    <Box p={4} minWidth="400px">
                      {component}
                    </Box>
                  </Card>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </SiteWrapper>
  )
}
