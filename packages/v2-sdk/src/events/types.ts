export type EventContext = {
  chainSlug: string
  chainId: number
  transactionHash: string
  transactionIndex: number
  logIndex: number
  blockNumber: number
  blockTimestamp: number
  from: string
  to: string
  value: string
  nonce: number
  gasLimit: number
  gasUsed: number
}

export type EventBase = {
  eventName: string
  eventLog?: any
  context?: EventContext
}
