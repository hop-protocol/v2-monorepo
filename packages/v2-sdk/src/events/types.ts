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
}

export type EventBase = {
  eventName: string
  eventLog?: any
  context?: EventContext
}
