
export enum EventType {
  BundleReceived = 'BundleReceived',
  BundleForwarded = 'BundleForwarded',
  BundleSet = 'BundleSet',
  BundleCommitted = 'BundleCommitted', // event from SpokeMessageBridge
  FeesSentToHub = 'FeesSentToHub',
  MessageBundled = 'MessageBundled'
}

export type EventContext = {
  chainSlug: string
  chainId: number
  transactionHash: string
  logIndex: number
  blockNumber: number
  blockTimestamp: number
}

export type EventBase = {
  context: EventContext
}
