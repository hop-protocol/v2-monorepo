
export enum EventType {
  BundleReceived = 'BundleReceived', // event from HubMessageBridge
  BundleForwarded = 'BundleForwarded', // event from HubMessageBridge
  BundleSet = 'BundleSet', // event from MessageBridge
  BundleCommitted = 'BundleCommitted', // event from SpokeMessageBridge
  FeesSentToHub = 'FeesSentToHub', // event from SpokeMessageBridge
  MessageBundled = 'MessageBundled', // event from SpokeMessageBridge
  MessageSent = 'MessageSent', // event from SpokeMessageBridge (ICrossChainSource)
  MessageRelayed = 'MessageRelayed', // event from SpokeMessageBridge (ICrossChainDestination)
  MessageReverted = 'MessageReverted' // event from SpokeMessageBridge (ICrossChainDestination)
}

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
  context: EventContext
}
