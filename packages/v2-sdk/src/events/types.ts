export type EventContext = {
  chainSlug: string
  chainId: number
  transactionHash: string
  transactionIndex: number
  logIndex: number
  blockNumber: number
  blockTimestamp: number
}

export type EventBase = {
  _eventName: string
  _event?: any
  context?: EventContext
}
