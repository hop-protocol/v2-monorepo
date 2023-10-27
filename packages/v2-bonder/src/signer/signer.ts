import { Wallet } from 'ethers'
import { privateKey } from '../config'

let signer: Wallet | null = null

function getSigner () {
  if (!signer) {
    if (privateKey) {
      signer = new Wallet(privateKey)
    }
  }
  return signer
}

function setSignerUsingPrivateKey (_privateKey: string) {
  signer = new Wallet(_privateKey)
}

export { getSigner, setSignerUsingPrivateKey }
