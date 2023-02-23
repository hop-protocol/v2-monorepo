import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { providers } from 'ethers'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { useInterval } from 'react-use'

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

export function useWeb3 () {
  const [onboardWallet, setOnboardWallet] = useState<any>()
  const [wallet, setWallet] = useState<any>()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

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

  async function getWallet() {
    const wallets = await onboard.connectWallet()
    const ethersProvider = new providers.Web3Provider(
      wallets[0].provider,
      'any'
    )
    const signer = ethersProvider.getSigner()
    if (signer) {
      setWallet(signer)
      const _address = await signer.getAddress()
      setAddress(_address)
    }
    return signer
  }

  return {
    onboard,
    wallet,
    getWallet,
    address,
    error,
    connect,
    disconnect
  }
}
