import { Wallet } from 'ethers'
import { privateKey } from '../config'

let signer: Wallet | null = null

if (privateKey) {
  signer = new Wallet(privateKey)
}

export { signer }
