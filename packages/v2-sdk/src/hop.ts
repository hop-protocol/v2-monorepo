import pkg from '../package.json'
import { EventFetcher } from './eventFetcher'
import { providers } from 'ethers'

export class Hop {
  eventFetcher: EventFetcher
  providers: Record<string, providers.Provider>

  constructor () {
    this.providers = {}
  }

  get version () {
    return pkg.version
  }
}
