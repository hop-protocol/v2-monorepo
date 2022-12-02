import { EventBase } from './types'

export interface MessageBundled extends EventBase {
  bundleId: string
  treeIndex: number
  messageId: string
}
