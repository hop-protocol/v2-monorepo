
export enum EventType {
  BundleReceived = 'BundleReceived', // event from HubMessageBridge
  BundleForwarded = 'BundleForwarded', // event from HubMessageBridge
  BundleSet = 'BundleSet', // event from MessageBridge
  BundleCommitted = 'BundleCommitted', // event from SpokeMessageBridge
  FeesSentToHub = 'FeesSentToHub', // event from SpokeMessageBridge
  MessageBundled = 'MessageBundled' // event from SpokeMessageBridge
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
